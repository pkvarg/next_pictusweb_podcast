import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const notifications = await prisma.vehicleNotification.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Failed to fetch vehicle notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle notifications' },
      { status: 500 }
    )
  }
}