import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { isValidPassword } from '@/lib/isValidPassword'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        deletedAt: null,
        active: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has a password
    if (!user.password) {
      return NextResponse.json({ error: 'No password set for this user' }, { status: 400 })
    }

    // Verify password
    const isValid = await isValidPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Password verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
