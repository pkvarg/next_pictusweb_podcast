import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { createHash, createHmac } from 'crypto'

const OTP_SALT = process.env.OTP_SALT!
const SESSION_SECRET = process.env.VERIFICATION_SESSION_SECRET!
const MAX_ATTEMPTS = 5

function hashCode(code: string, identifier: string): string {
  return createHash('sha256')
    .update(`${code}:${identifier}:${OTP_SALT}`)
    .digest('hex')
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

async function verifyOneCode(
  code: string,
  token: string,
  identifier: string,
  purpose: string,
): Promise<boolean> {
  const tokenHash = hashToken(token)

  const record = await prisma.verificationCode.findUnique({
    where: { tokenHash },
  })

  if (!record || record.usedAt || record.expiresAt < new Date() || record.purpose !== purpose) {
    return false
  }

  // Increment attempts
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
  })

  if (record.attempts + 1 > MAX_ATTEMPTS) {
    return false
  }

  const expectedHash = hashCode(code, identifier)
  if (record.codeHash !== expectedHash) return false

  // Mark as used
  await prisma.verificationCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  })

  return true
}

export async function POST(request: NextRequest) {
  try {
    const { email, phoneNumber, emailCode, phoneCode, emailToken, phoneToken } =
      await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Dev skip: NEXT_PUBLIC_SKIP_VERIFICATION=true accepts '000000'
    if (
      process.env.NEXT_PUBLIC_SKIP_VERIFICATION === 'true' &&
      process.env.SKIP_VERIFICATION_ALLOWED === 'true'
    ) {
      if (emailCode === '000000' && phoneCode === '000000') {
        return NextResponse.json({ emailVerified: true, phoneVerified: true })
      }
    }

    // Verify email token & code
    let emailVerified = false
    if (emailToken && emailCode) {
      const tokenData = verifyToken(emailToken)
      if (tokenData && tokenData.purpose === 'onboard_email') {
        emailVerified = await verifyOneCode(emailCode, emailToken, email, 'onboard_email')
      }
    }

    // Verify phone token & code
    let phoneVerified = false
    if (phoneToken && phoneCode && phoneNumber) {
      const tokenData = verifyToken(phoneToken)
      if (tokenData && tokenData.purpose === 'onboard_phone') {
        phoneVerified = await verifyOneCode(phoneCode, phoneToken, phoneNumber, 'onboard_phone')
      }
    }

    return NextResponse.json({ emailVerified, phoneVerified })
  } catch (error: any) {
    console.error('Verify code error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
