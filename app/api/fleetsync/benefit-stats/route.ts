import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

/**
 * GET - Fetch benefit users stats for a parent organization.
 * Returns each benefit user with their name, email, vehicle count, and notification usage.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    // Find all benefit users linked to this parent org
    const benefitUsers = await prisma.user.findMany({
      where: {
        benefitParentOrgId: organizationId,
        isBenefit: true,
        deletedAt: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        active: true,
        benefitGdprAccepted: true,
        organizationId: true,
        organizationRelation: {
          select: {
            id: true,
            name: true,
            currentVehiclesCount: true,
            currentNotificationsCount: true,
            deletedAt: true,
          },
        },
      },
    })

    const stats = benefitUsers.map((user) => ({
      userId: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email,
      subOrgId: user.organizationRelation?.id || null,
      vehiclesCount: user.organizationRelation?.currentVehiclesCount || 0,
      notificationsUsed: user.organizationRelation?.currentNotificationsCount || 0,
      active: user.active,
      gdprAccepted: user.benefitGdprAccepted,
      subOrgActive: user.organizationRelation?.deletedAt === null,
    }))

    const totalBenefitVehicles = stats.reduce((sum, s) => sum + s.vehiclesCount, 0)
    const totalBenefitNotifications = stats.reduce((sum, s) => sum + s.notificationsUsed, 0)

    return NextResponse.json({
      benefitUsers: stats,
      totalBenefitVehicles,
      totalBenefitNotifications,
    })
  } catch (error: any) {
    console.error('Error fetching benefit stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch benefit stats', details: error.message },
      { status: 500 }
    )
  }
}
