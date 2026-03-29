import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { checkTierLimit, TierLimitError } from '@/lib/tier-limits'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationIdParam = searchParams.get('organizationId')

    // Always get session to check user
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Note: Removed fleet manager check - all authenticated users can view vehicles from their organization
    // Fleet manager features are controlled at the UI/page level, not the API level

    let organizationId: string | null = null
    let isPictusaciUser = false

    // Get organizationId and check if user is PICTUSACI
    if (session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          organizationId: true,
          organizationRelation: {
            select: {
              name: true
            }
          }
        }
      })
      organizationId = user?.organizationId || null

      // Check if user is in PICTUSACI organization
      if (user?.organizationRelation?.name === 'PICTUSACI') {
        isPictusaciUser = true
      }
    }

    // If organizationIdParam is provided, use it (for admin calls)
    // But still check PICTUSACI flag based on logged-in user
    if (organizationIdParam) {
      organizationId = organizationIdParam
    }

    if (!organizationId && !isPictusaciUser) {
      return NextResponse.json({ error: 'No organization assigned' }, { status: 400 })
    }

    // Build the where clause
    // If organizationIdParam is explicitly provided, always filter by it (used when creating notifications)
    // If no param provided, PICTUSACI users can view all vehicles, but others see only their organization
    const whereClause: any = {
      deletedAt: null,
    }

    console.log('[MY-VEHICLES GET] User:', session.user.email)
    console.log('[MY-VEHICLES GET] Organization:', organizationId)
    console.log('[MY-VEHICLES GET] organizationIdParam:', organizationIdParam)
    console.log('[MY-VEHICLES GET] Is PICTUSACI user:', isPictusaciUser)

    // If organizationIdParam was explicitly provided, always filter by it (even for PICTUSACI)
    if (organizationIdParam && organizationIdParam !== 'all') {
      whereClause.organizationId = organizationIdParam
    }
    // If no param provided and not PICTUSACI user, filter by user's organization
    else if (!organizationIdParam && !isPictusaciUser && organizationId) {
      whereClause.organizationId = organizationId
    }
    // If no param provided and IS PICTUSACI user, don't filter (show all vehicles)
    // But exclude organizations hidden from PICTUSACI
    if (isPictusaciUser && !organizationIdParam) {
      whereClause.organizationRelation = { hiddenFromPictusaci: false }
    }

    console.log('[MY-VEHICLES GET] WhereClause:', JSON.stringify(whereClause))

    const vehicles = await prisma.myVehicle.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        organizationRelation: {
          select: {
            id: true,
            name: true,
          }
        },
        expenses: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
        },
        mileageRecords: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log('[MY-VEHICLES GET] Returning', vehicles.length, 'vehicles')

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Allow admins or fleet managers
    if (session.user.role !== 'ADMIN' && !session.user.isFleetManager) {
      return NextResponse.json({ error: 'Forbidden - Admin or Fleet Manager access required' }, { status: 403 })
    }

    const body = await request.json()
    const { organizationId, type, registration, year, image, note } = body

    if (!type || !registration) {
      return NextResponse.json(
        { error: 'Type and registration are required' },
        { status: 400 }
      )
    }

    // Get organizationId - prefer provided organizationId, fallback to user's organizationId
    // Non-admin fleet managers can only create for their own organization
    let vehicleOrganizationId: string | null = null

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    })
    const userOrganizationId = user?.organizationId || null

    if (organizationId) {
      vehicleOrganizationId = organizationId

      // Non-admin users can only create vehicles for their own organization
      if (session.user.role !== 'ADMIN' && vehicleOrganizationId !== userOrganizationId) {
        return NextResponse.json(
          { error: 'Fleet managers can only create vehicles for their own organization' },
          { status: 403 }
        )
      }
    } else {
      vehicleOrganizationId = userOrganizationId
    }

    if (!vehicleOrganizationId) {
      return NextResponse.json({ error: 'No organization specified' }, { status: 400 })
    }

    // Check tier limit
    try {
      await checkTierLimit(vehicleOrganizationId, 'vehicles')
    } catch (error) {
      if (error instanceof TierLimitError) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      throw error
    }

    const vehicle = await prisma.myVehicle.create({
      data: {
        organizationId: vehicleOrganizationId,
        type,
        registration,
        year: year || null,
        image: image || null,
        note: note || null,
        userId: session.user.id,
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

    // Increment vehicle count on organization
    await prisma.organization.update({
      where: { id: vehicleOrganizationId },
      data: { currentVehiclesCount: { increment: 1 } },
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 })
  }
}
