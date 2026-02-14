import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.isFleetManager) {
      return NextResponse.json({ error: 'Forbidden - Fleet Manager access required' }, { status: 403 })
    }

    // Verify vehicle belongs to user's organization
    const vehicle = await prisma.myVehicle.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: session.user.organization,
        deletedAt: null,
      },
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const mileageRecords = await prisma.myVehicleMileage.findMany({
      where: {
        vehicleId: resolvedParams.id,
        deletedAt: null,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(mileageRecords)
  } catch (error) {
    console.error('Error fetching mileage:', error)
    return NextResponse.json({ error: 'Failed to fetch mileage' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.isFleetManager) {
      return NextResponse.json({ error: 'Forbidden - Fleet Manager access required' }, { status: 403 })
    }

    // Verify vehicle belongs to user's organization
    const vehicle = await prisma.myVehicle.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: session.user.organization,
        deletedAt: null,
      },
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const body = await request.json()
    const { kilometers, date, note } = body

    if (!kilometers || !date) {
      return NextResponse.json(
        { error: 'Kilometers and date are required' },
        { status: 400 }
      )
    }

    const mileageRecord = await prisma.myVehicleMileage.create({
      data: {
        vehicleId: resolvedParams.id,
        kilometers: parseInt(kilometers),
        date: new Date(date),
        note: note || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(mileageRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating mileage record:', error)
    return NextResponse.json({ error: 'Failed to create mileage record' }, { status: 500 })
  }
}
