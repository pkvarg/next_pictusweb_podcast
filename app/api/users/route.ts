import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { hashPassword } from '../../../lib/isValidPassword'
import { checkIPBan } from '@/lib/checkIPBan'
import { checkTierLimit, TierLimitError } from '@/lib/tier-limits'
import { randomUUID } from 'crypto'
import axios from 'axios'

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
    const excludeBenefit = searchParams.get('excludeBenefit')

    const whereClause: any = {
      deletedAt: null,
    }

    // Filter by organization if provided
    if (organizationId) {
      whereClause.organizationId = organizationId
    }

    // Exclude benefit users from parent org's user list
    if (excludeBenefit === 'true') {
      whereClause.isBenefit = false
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
        isBenefit: true,
        createdAt: true,
        lastLoggedIn: true,
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
    const { email, firstName, lastName, phoneNumber, organizationId, active, isFleetManager, password, loginProvider, isBenefit, locale } = body

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, firstName, and lastName are required' },
        { status: 400 }
      )
    }

    // Hash password if provided, otherwise use default
    let hashedPassword = null
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD

    if (password && password.trim() !== '') {
      hashedPassword = await hashPassword(password)
    } else if (!loginProvider || loginProvider === '' || loginProvider === 'hybrid') {
      hashedPassword = await hashPassword(defaultPassword)
      console.log(`Set default password for new user: ${email}`)
    }

    // ── Benefit user flow ──
    if (isBenefit && organizationId) {
      // Verify parent org has benefit creation enabled
      const parentOrg = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: { tierRelation: true },
      })

      if (!parentOrg || !parentOrg.canCreateBenefit) {
        return NextResponse.json(
          { error: 'This organization is not enabled for benefit user creation' },
          { status: 403 }
        )
      }

      // Prevent sub-orgs (benefit orgs) from creating nested benefit users
      if (parentOrg.isBenefitOrg || parentOrg.parentOrganizationId) {
        return NextResponse.json(
          { error: 'Sub-organizations cannot create benefit users' },
          { status: 403 }
        )
      }

      const benefitActivationToken = randomUUID()
      const subOrgName = firstName && lastName
        ? `${parentOrg.name} — ${firstName} ${lastName}`
        : `${parentOrg.name} — ${email}`

      // Transaction: create sub-org (dormant) + user (inactive)
      const result = await prisma.$transaction(async (tx) => {
        const subOrg = await tx.organization.create({
          data: {
            name: subOrgName,
            parentOrganizationId: parentOrg.id,
            tierId: parentOrg.tierId,
            isBenefitOrg: true,
            deletedAt: new Date(), // dormant until user accepts GDPR
            usersLimit: 1,
            // vehicles/notifications/templates = null → uses parent's pool
          },
        })

        const user = await tx.user.create({
          data: {
            email,
            firstName,
            lastName,
            phoneNumber: phoneNumber || null,
            organizationId: subOrg.id,
            active: false, // pending GDPR acceptance
            isFleetManager: isFleetManager || false,
            password: hashedPassword,
            loginProvider: loginProvider || null,
            isBenefit: true,
            benefitParentOrgId: parentOrg.id,
            benefitActivationToken,
          },
          include: {
            organizationRelation: {
              select: { id: true, name: true }
            }
          }
        })

        return { user, subOrg }
      })

      // Send activation email to benefit user (non-blocking)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || ''
      const userLocale = locale || 'sk'
      const activationUrl = `${appUrl}/${userLocale}/fleetsync/benefit-activate?token=${benefitActivationToken}`

      try {
        await axios.post(`${process.env.NEXT_PUBLIC_HONO_API_URL}/api/pictusweb/client/benefit-activation`, {
          userEmail: email,
          userName: `${firstName} ${lastName}`,
          parentOrgName: parentOrg.name,
          activationUrl,
          locale: userLocale,
        })
      } catch (emailError) {
        console.error('Failed to send benefit activation email:', emailError)
      }

      // Send info email to admin (non-blocking)
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_HONO_API_URL}/api/pictusweb/client/benefit-notification`, {
          parentOrgName: parentOrg.name,
          parentOrgId: parentOrg.id,
          userEmail: email,
          userName: `${firstName} ${lastName}`,
          subOrgName: result.subOrg.name,
          subOrgId: result.subOrg.id,
          locale: userLocale,
        })
      } catch (emailError) {
        console.error('Failed to send benefit admin notification:', emailError)
      }

      return NextResponse.json(
        { ...result.user, benefitPending: true, subOrgId: result.subOrg.id },
        { status: 201 }
      )
    }

    // ── Standard user flow ──
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