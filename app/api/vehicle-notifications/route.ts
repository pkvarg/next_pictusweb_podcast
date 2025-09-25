import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company')

    let whereClause = {}

    if (company) {
      if (company === 'all') {
        // Show all organizations
        whereClause = {}
      } else if (company === 'demo') {
        // Show all organizations that start with 'demo' or 'DEMO' (case insensitive)
        whereClause = {
          company: {
            startsWith: 'demo',
            mode: 'insensitive' as const
          }
        }
      } else {
        // Show only specific organization (exact match)
        whereClause = {
          company: {
            equals: company,
            mode: 'insensitive' as const
          }
        }
      }
    }

    const notifications = await prisma.vehicleNotification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
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