import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

/**
 * POST - Revoke a benefit user's access.
 * Sets user.isBenefit=false, user.active=false, sub-org.deletedAt=now()
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, organizationId } = await request.json()

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'userId and organizationId are required' },
        { status: 400 }
      )
    }

    // Find the benefit user and verify ownership
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isBenefit: true,
        benefitParentOrgId: true,
        organizationId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.isBenefit || user.benefitParentOrgId !== organizationId) {
      return NextResponse.json(
        { error: 'User is not a benefit user of this organization' },
        { status: 403 }
      )
    }

    // Transaction: deactivate user + soft-delete sub-org
    await prisma.$transaction(async (tx) => {
      // Deactivate benefit user
      await tx.user.update({
        where: { id: userId },
        data: {
          isBenefit: false,
          active: false,
        },
      })

      // Soft-delete the benefit sub-org
      if (user.organizationId) {
        const subOrg = await tx.organization.findUnique({
          where: { id: user.organizationId },
          select: { isBenefitOrg: true },
        })

        if (subOrg?.isBenefitOrg) {
          await tx.organization.update({
            where: { id: user.organizationId },
            data: {
              deletedAt: new Date(),
            },
          })
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error revoking benefit:', error)
    return NextResponse.json(
      { error: 'Failed to revoke benefit', details: error.message },
      { status: 500 }
    )
  }
}
