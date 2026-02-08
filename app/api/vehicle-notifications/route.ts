import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company')

    let whereClause: any = {
      deletedAt: null, // Filter out soft-deleted records
    }

    if (company) {
      if (company === 'all') {
        // Show all organizations (but still exclude deleted)
        whereClause = { deletedAt: null }
      } else if (company === 'demo') {
        // Show all organizations that start with 'demo' or 'DEMO' (case insensitive)
        whereClause = {
          deletedAt: null,
          company: {
            startsWith: 'demo',
            mode: 'insensitive' as const
          }
        }
      } else {
        // Show only specific organization (exact match)
        whereClause = {
          deletedAt: null,
          company: {
            equals: company,
            mode: 'insensitive' as const
          }
        }
      }
    }

    const notifications = await prisma.vehicleNotification.findMany({
      where: whereClause,
      include: {
        myVehicle: {
          select: {
            id: true,
            image: true,
            registration: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
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