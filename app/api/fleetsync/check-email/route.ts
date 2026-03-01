import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ available: false, error: 'Invalid email' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    const available = !existingUser

    return NextResponse.json({ available })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({ available: false, error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
