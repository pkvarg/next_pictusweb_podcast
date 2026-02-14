import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company') // Legacy param for backward compatibility
    const organizationName = searchParams.get('organizationName')
    const organizationId = searchParams.get('organizationId')
    const sortBy = searchParams.get('sortBy') // 'notificationDate' or 'dutyDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc' // 'asc' or 'desc'
    const status = searchParams.get('status') || 'active' // 'active', 'deleted', or 'all'

    let whereClause: any = {}

    // Handle deleted/active filter (always at top level)
    if (status === 'active') {
      whereClause.deletedAt = null // Only active (not deleted)
    } else if (status === 'deleted') {
      whereClause.deletedAt = { not: null } // Only deleted
    }
    // If status === 'all', don't filter by deletedAt (show all)

    // Priority 1: Filter by organizationId (UUID)
    if (organizationId && organizationId !== 'all') {
      whereClause.organizationId = organizationId
    }
    // Priority 2: Filter by organization name through notification's organization relation
    else if (organizationName && organizationName !== 'all') {
      whereClause.organization = {
        name: {
          equals: organizationName,
          mode: 'insensitive' as const,
        },
      }
    }
    // Priority 3: Legacy company parameter - map to organization name
    else if (company && company !== 'all') {
      if (company === 'demo') {
        // Show all organizations that start with 'demo' or 'DEMO' (case insensitive)
        whereClause.organization = {
          name: {
            startsWith: 'demo',
            mode: 'insensitive' as const,
          },
        }
      } else {
        // Show only specific organization (exact match by name)
        whereClause.organization = {
          name: {
            equals: company,
            mode: 'insensitive' as const,
          },
        }
      }
    }

    // Build orderBy clause
    let orderBy: any = {
      createdAt: 'desc',
    }

    if (sortBy === 'notificationDate') {
      orderBy = {
        notificationDate: sortOrder === 'asc' ? 'asc' : 'desc',
      }
    } else if (sortBy === 'dutyDate') {
      orderBy = {
        dutyDate: sortOrder === 'asc' ? 'asc' : 'desc',
      }
    }

    const notifications = await prisma.vehicleNotification.findMany({
      where: whereClause,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        myVehicle: {
          select: {
            id: true,
            image: true,
            registration: true,
            type: true,
            organizationId: true,
            organizationRelation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy,
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Failed to fetch vehicle notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle notifications' },
      { status: 500 }
    )
  }
}