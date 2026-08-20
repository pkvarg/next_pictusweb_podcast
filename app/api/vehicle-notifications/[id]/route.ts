import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = parseInt(idString)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 })
    }

    const notification = await prisma.vehicleNotification.findFirst({
      where: {
        id,
        deletedAt: null,
      },
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
          },
        },
      },
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Failed to fetch vehicle notification:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicle notification' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idString } = await params
    const id = parseInt(idString)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      organizationId,
      personName,
      email,
      phoneNumber,
      vehicleId,
      vehicleRegistration,
      notificationType,
      notificationChannel,
      notificationDate,
      dutyDate,
      emailMessage,
      status,
    } = body

    // Only future (not-yet-sent) notifications may be edited.
    const existing = await prisma.vehicleNotification.findFirst({
      where: { id, deletedAt: null },
      select: { status: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }
    if (existing.status !== 'imported') {
      return NextResponse.json(
        { error: 'Only future notifications can be edited' },
        { status: 409 },
      )
    }

    // Build update data object with only provided fields
    const updateData: any = {}
    if (organizationId !== undefined) updateData.organizationId = organizationId
    if (personName !== undefined) updateData.personName = personName
    if (email !== undefined) updateData.email = email
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
    if (vehicleId) {
      const vehicle = await prisma.myVehicle.findUnique({
        where: { id: vehicleId },
        include: { user: true },
      })
      if (vehicle) {
        updateData.myVehicleId = vehicle.id
        updateData.vehicleRegistration = vehicle.registration
        updateData.userId = vehicle.userId
        updateData.organizationId = vehicle.organizationId
      }
    }
    if (vehicleRegistration !== undefined) updateData.vehicleRegistration = vehicleRegistration
    if (notificationType !== undefined) updateData.notificationType = notificationType
    if (notificationChannel !== undefined) updateData.notificationChannel = notificationChannel
    if (notificationDate !== undefined)
      updateData.notificationDate = notificationDate ? new Date(notificationDate) : null
    if (dutyDate !== undefined) updateData.dutyDate = dutyDate ? new Date(dutyDate) : null
    if (emailMessage !== undefined) updateData.emailMessage = emailMessage
    if (status !== undefined) updateData.status = status

    const notification = await prisma.vehicleNotification.update({
      where: {
        id,
      },
      data: updateData,
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
          },
        },
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Failed to update vehicle notification:', error)
    return NextResponse.json({ error: 'Failed to update vehicle notification' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idString } = await params
    const id = parseInt(idString)

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 })
    }

    // Soft delete - set deletedAt timestamp
    await prisma.vehicleNotification.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete vehicle notification:', error)
    return NextResponse.json({ error: 'Failed to delete vehicle notification' }, { status: 500 })
  }
}
