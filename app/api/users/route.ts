import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../../lib/isValidPassword'
import { checkIPBan } from '@/lib/checkIPBan'
import { checkTierLimit, TierLimitError } from '@/lib/tier-limits'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Check if IP is banned
    const ipCheck = await checkIPBan(request)
    if (ipCheck.isBanned && ipCheck.banInfo) {
      return NextResponse.json(
        {
          error: 'Access Denied',
          message: ipCheck.banInfo.message,
        },
        { status: 403 },
      )
    }

    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    const whereClause: any = {
      deletedAt: null,
    }

    // Filter by organization if provided
    if (organizationId) {
      whereClause.organizationId = organizationId
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        organizationId: true,
        organizationRelation: {
          select: {
            id: true,
            name: true,
          }
        },
        role: true,
        active: true,
        isFleetManager: true,
        createdAt: true,
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
    // Check if IP is banned
    const ipCheck = await checkIPBan(request)
    if (ipCheck.isBanned && ipCheck.banInfo) {
      return NextResponse.json(
        {
          error: 'Access Denied',
          message: ipCheck.banInfo.message,
        },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { email, firstName, lastName, phoneNumber, organizationId, active, isFleetManager, password, loginProvider } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, firstName, and lastName are required' },
        { status: 400 }
      )
    }

    // Check tier limit if organizationId is provided
    if (organizationId) {
      try {
        await checkTierLimit(organizationId, 'users')
      } catch (error) {
        if (error instanceof TierLimitError) {
          return NextResponse.json({ error: error.message }, { status: 403 })
        }
        throw error
      }
    }

    // Hash password if provided, otherwise use default
    let hashedPassword = null
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD

    if (password && password.trim() !== '') {
      // Use provided password
      hashedPassword = await hashPassword(password)
    } else if (!loginProvider || loginProvider === '' || loginProvider === 'hybrid') {
      // Set default password for users without OAuth provider or hybrid users
      hashedPassword = await hashPassword(defaultPassword)
      console.log(`Set default password for new user: ${email}`)
    }
    // For OAuth-only users (google, github), password remains null

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        organizationId: organizationId || null,
        active: active !== undefined ? active : true,
        isFleetManager: isFleetManager || false,
        password: hashedPassword,
        loginProvider: loginProvider || null,
      },
      include: {
        organizationRelation: {
          select: {
            id: true,
            name: true,
          }
        }
      }
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