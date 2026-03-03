import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET - Validate a benefit activation token (for page load)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { benefitActivationToken: token },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        active: true,
        benefitParentOrgId: true,
      },
    })

    if (!user || user.active) {
      return NextResponse.json({ valid: false })
    }

    // Get parent org name
    let parentOrgName = ''
    if (user.benefitParentOrgId) {
      const parentOrg = await prisma.organization.findUnique({
        where: { id: user.benefitParentOrgId },
        select: { name: true },
      })
      parentOrgName = parentOrg?.name || ''
    }

    return NextResponse.json({
      valid: true,
      parentOrgName,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    })
  } catch (error: any) {
    console.error('Benefit activation validation error:', error)
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 })
  }
}

/**
 * POST - Accept GDPR & Trade Rules, activate benefit user + sub-org
 */
export async function POST(request: NextRequest) {
  try {
    const { token, gdprAccepted, termsAccepted } = await request.json()

    if (!token || !gdprAccepted || !termsAccepted) {
      return NextResponse.json(
        { error: 'Token and both consents are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { benefitActivationToken: token },
      select: {
        id: true,
        active: true,
        organizationId: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired activation token' },
        { status: 404 }
      )
    }

    if (user.active) {
      return NextResponse.json(
        { error: 'Account is already activated' },
        { status: 400 }
      )
    }

    // Transaction: activate user + un-soft-delete sub-org
    await prisma.$transaction(async (tx) => {
      // Activate user
      await tx.user.update({
        where: { id: user.id },
        data: {
          active: true,
          benefitGdprAccepted: true,
          benefitGdprAcceptedAt: new Date(),
          benefitTermsAccepted: true,
          benefitTermsAcceptedAt: new Date(),
          benefitActivationToken: null, // single-use
        },
      })

      // Activate sub-org (remove soft-delete)
      if (user.organizationId) {
        await tx.organization.update({
          where: { id: user.organizationId },
          data: {
            deletedAt: null, // ORG IS NOW LIVE
          },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Benefit activation error:', error)
    return NextResponse.json(
      { error: 'Failed to activate benefit account', details: error.message },
      { status: 500 }
    )
  }
}
