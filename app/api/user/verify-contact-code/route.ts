import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createHash, createHmac } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()
const OTP_SALT = process.env.OTP_SALT!
const SESSION_SECRET = process.env.VERIFICATION_SESSION_SECRET!
const MAX_ATTEMPTS = 5

function hashCode(code: string, identifier: string): string {
  return createHash('sha256').update(`${code}:${identifier}:${OTP_SALT}`).digest('hex')
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function verifyToken(token: string): { identifier: string; purpose: string } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const lastColon = decoded.lastIndexOf(':')
    const sig = decoded.slice(lastColon + 1)
    const payload = decoded.slice(0, lastColon)
    const expectedSig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
    if (sig !== expectedSig) return null
    const parts = payload.split(':')
    const expiresAt = Number(parts[parts.length - 1])
    if (Date.now() > expiresAt) return null
    const purpose = parts[parts.length - 2]
    const identifier = parts.slice(0, -2).join(':')
    return { identifier, purpose }
  } catch {
    return null
  }
}

// POST /api/user/verify-contact-code
// Body: { verificationToken, code, type: 'email' | 'phone' }
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { verificationToken, code, type } = await request.json()

    if (!verificationToken || !code || !type) {
      return NextResponse.json({ error: 'Chýbajú povinné polia' }, { status: 400 })
    }

    const purpose = type === 'email' ? 'user_email_verify' : 'user_phone_verify'

    const tokenData = verifyToken(verificationToken)
    if (!tokenData || tokenData.purpose !== purpose || tokenData.identifier !== userId) {
      return NextResponse.json({ error: 'Neplatný alebo expirovaný token' }, { status: 401 })
    }

    const tokenHash = hashToken(verificationToken)
    const record = await prisma.verificationCode.findUnique({ where: { tokenHash } })

    if (!record || record.usedAt || record.expiresAt < new Date() || record.purpose !== purpose) {
      return NextResponse.json({ error: 'Neplatný alebo expirovaný kód' }, { status: 401 })
    }

    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    })

    if (record.attempts + 1 > MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: 'Príliš veľa nesprávnych pokusov. Vyžiadajte nový kód.' },
        { status: 429 },
      )
    }

    if (record.codeHash !== hashCode(code, userId)) {
      const remaining = MAX_ATTEMPTS - (record.attempts + 1)
      return NextResponse.json(
        { error: 'Nesprávny kód', attemptsRemaining: remaining },
        { status: 401 },
      )
    }

    // Mark code as used and update the user record
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    })

    if (type === 'email') {
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
      })
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { phoneVerified: new Date() },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Verify contact code error:', error)
    return NextResponse.json({ error: 'Overenie zlyhalo' }, { status: 500 })
  }
}
