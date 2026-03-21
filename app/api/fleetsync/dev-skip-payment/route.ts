import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_SKIP_VERIFICATION !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 403 })
  }

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
      tier,
      billing,
      numberOfVehicles,
    } = body
    const phoneNumber = rawPhone ? rawPhone.replace(/\s+/g, '') : null

    if (!organizationName || !firstName || !lastName || !email || !password || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const tierRecord = await prisma.tier.findUnique({
      where: { name: tier },
    })

    if (!tierRecord) {
      return NextResponse.json({ error: `Tier ${tier} not found` }, { status: 500 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const vehicles = numberOfVehicles || 1

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
          tierId: tierRecord.id,
          parentOrganizationId: null,
          onboardedBy: email,
          notificationPeriodStart: new Date(),
          purchasedVehicles: vehicles,
          billingInterval: billing || 'monthly',
          usersLimit: tierRecord.usersLimit,
          vehiclesLimit: vehicles,
          notificationsLimit: tierRecord.notificationsLimit,
          templatesLimit: tierRecord.templatesLimit,
          notificationTypesLimit: tierRecord.notificationTypesLimit,
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

    return NextResponse.json({
      success: true,
      organization: { id: result.organization.id, name: result.organization.name },
      user: result.user,
    }, { status: 201 })
  } catch (error) {
    console.error('Dev skip payment error:', error)
    return NextResponse.json({
      error: 'Failed to create account',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
