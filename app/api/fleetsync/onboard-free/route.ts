import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationName,
      organizationContact,
      ico,
      dic,
      street,
      city,
      postalCode,
      country,
      firstName,
      lastName,
      email,
      password,
      phoneNumber: rawPhone,
    } = body
    const phoneNumber = rawPhone ? rawPhone.replace(/\s+/g, '') : null

    // Validate required fields
    if (!organizationName || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Organization name, first name, last name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Find the FREE tier
    const freeTier = await prisma.tier.findUnique({
      where: { name: 'FREE' },
    })

    if (!freeTier) {
      return NextResponse.json({ error: 'FREE tier not found' }, { status: 500 })
    }

    // Create org + user in transaction
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          mainContact: organizationContact || null,
          ico: ico || null,
          dic: dic || null,
          street: street || null,
          city: city || null,
          postalCode: postalCode || null,
          country: country || null,
          tierId: freeTier.id,
          parentOrganizationId: null,
          onboardedBy: email,
          notificationPeriodStart: new Date(),
          purchasedVehicles: 1,
          usersLimit: freeTier.usersLimit,
          vehiclesLimit: 1,
          notificationsLimit: freeTier.notificationsLimit,
          templatesLimit: freeTier.templatesLimit,
          notificationTypesLimit: freeTier.notificationTypesLimit,
        },
      })

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
          isFleetManager: true,
          loginProvider: 'credentials',
          emailVerified: new Date(),
          phoneVerified: new Date(),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      })

      return { organization, user }
    })

    return NextResponse.json(
      {
        success: true,
        organization: { id: result.organization.id, name: result.organization.name },
        user: result.user,
        message: 'Account created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Free onboarding error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create account',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
