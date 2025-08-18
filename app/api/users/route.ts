import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../../lib/isValidPassword'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users', details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, organization, active, password, loginProvider } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, firstName, and lastName are required' },
        { status: 400 }
      )
    }

    // Hash password if provided
    let hashedPassword = null
    if (password && password.trim() !== '') {
      hashedPassword = await hashPassword(password)
    }

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        organization: organization || null,
        active: active !== undefined ? active : true,
        password: hashedPassword,
        loginProvider: loginProvider || null,
        name: `${firstName} ${lastName}`, // Combine first and last name
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create user', details: error.message }, { status: 500 })
  }
}