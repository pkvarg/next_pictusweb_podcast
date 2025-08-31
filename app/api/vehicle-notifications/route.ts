import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company = searchParams.get('company')

    const whereClause = company ? { company: { equals: company, mode: 'insensitive' as const } } : {}

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