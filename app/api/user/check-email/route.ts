import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        deletedAt: null,
        active: true,
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    const name = user.name || `${user.firstName} ${user.lastName}`

    return NextResponse.json({ exists: true, name }, { status: 200 })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
