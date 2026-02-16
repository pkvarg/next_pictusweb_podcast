import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is from PICTUSACI organization
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organizationRelation: {
          select: {
            name: true
          }
        }
      }
    })

    if (currentUser?.organizationRelation?.name !== 'PICTUSACI') {
      return NextResponse.json({ error: 'Forbidden - Only PICTUSACI users can onboard clients' }, { status: 403 })
    }

    const body = await request.json()
    const {
      // Organization data
      organizationName,
      organizationMainContact,
      tierId,
      // New user data
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      isFleetManager
    } = body

    // Validate required fields
    if (!organizationName || !tierId) {
      return NextResponse.json({ error: 'Organization name and tier are required' }, { status: 400 })
    }

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'First name, last name, email, and password are required' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Fetch tier to determine if notificationPeriodStart should be set
    const tier = await prisma.tier.findUnique({
      where: { id: tierId },
      select: { name: true }
    })
    const tierName = tier?.name?.toUpperCase() || ''
    const isPaidTier = tierName === 'PREMIUM' || tierName === 'BUSINESS'

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create the organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          mainContact: organizationMainContact || null,
          tierId: tierId,
          parentOrganizationId: currentUser?.organizationId || null,
          onboardedBy: session.user.email,
          notificationPeriodStart: isPaidTier ? new Date() : null,
        },
        include: {
          tierRelation: {
            select: {
              id: true,
              name: true,
              usersLimit: true,
              vehiclesLimit: true,
              notificationsLimit: true,
              templatesLimit: true,
              notificationTypesLimit: true,
            }
          }
        }
      })

      // Step 2: Create new user in the new organization
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phoneNumber: phoneNumber || null,
          role: 'CLIENT',
          active: true,
          organizationId: organization.id,
          isFleetManager: isFleetManager || false,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          isFleetManager: true,
          organizationId: true,
        }
      })

      return { organization, user }
    })

    // TODO: Send welcome email to the user

    return NextResponse.json({
      success: true,
      organization: result.organization,
      user: result.user,
      message: 'Organization and user created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to onboard client:', error)
    return NextResponse.json({
      error: 'Failed to onboard client',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
