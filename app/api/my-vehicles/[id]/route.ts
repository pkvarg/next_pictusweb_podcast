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

    const vehicle = await prisma.myVehicle.findFirst({
      where: {
        id: resolvedParams.id,
        organization: session.user.organization,
        deletedAt: null,
      },
      include: {
        expenses: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
        },
        mileageRecords: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 })
  }
}

export async function PUT(
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

    const body = await request.json()
    const { type, registration, year, image, note } = body

    // Verify vehicle belongs to user's organization
    const existingVehicle = await prisma.myVehicle.findFirst({
      where: {
        id: resolvedParams.id,
        organization: session.user.organization,
        deletedAt: null,
      },
    })

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (type !== undefined) updateData.type = type
    if (registration !== undefined) updateData.registration = registration
    if (year !== undefined) updateData.year = year || null
    if (image !== undefined) updateData.image = image || null
    if (note !== undefined) updateData.note = note || null
    // Always update userId to track who last modified the record
    updateData.userId = session.user.id

    const vehicle = await prisma.myVehicle.update({
      where: {
        id: resolvedParams.id,
      },
      data: updateData,
    })

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 })
  }
}

export async function DELETE(
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
    const existingVehicle = await prisma.myVehicle.findFirst({
      where: {
        id: resolvedParams.id,
        organization: session.user.organization,
        deletedAt: null,
      },
    })

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Soft delete the vehicle and track who deleted it
    await prisma.myVehicle.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        deletedAt: new Date(),
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Vehicle deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 })
  }
}
