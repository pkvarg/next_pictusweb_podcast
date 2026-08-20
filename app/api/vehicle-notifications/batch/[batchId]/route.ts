import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

const DAY_MS = 24 * 60 * 60 * 1000

async function loadFutureBatchRows(batchId: string) {
  return prisma.vehicleNotification.findMany({
    where: {
      deletedAt: null,
      status: 'imported',
      OR: [{ dutyBatchId: batchId }, { pdrReminderFor: batchId }],
    },
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  try {
    const { batchId } = await params
    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      organizationId,
      personName,
      email,
      phoneNumber,
      vehicleId,
      notificationType,
      notificationChannel,
      dutyDate,
      emailMessage,
    } = body

    const rows = await loadFutureBatchRows(batchId)
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No editable (future) notifications found for this batch' },
        { status: 404 },
      )
    }

    const shared: any = {}
    if (personName !== undefined) shared.personName = personName
    if (email !== undefined) shared.email = email
    if (phoneNumber !== undefined) shared.phoneNumber = phoneNumber
    if (notificationType !== undefined) shared.notificationType = notificationType
    if (notificationChannel !== undefined) shared.notificationChannel = notificationChannel
    if (emailMessage !== undefined) shared.emailMessage = emailMessage
    if (organizationId !== undefined) shared.organizationId = organizationId

    if (vehicleId) {
      const vehicle = await prisma.myVehicle.findUnique({
        where: { id: vehicleId },
        include: { user: true },
      })
      if (vehicle) {
        shared.vehicleRegistration = vehicle.registration
        shared.myVehicleId = vehicle.id
        shared.userId = vehicle.userId
        shared.organizationId = vehicle.organizationId
      }
    }

    const newDutyDate = dutyDate ? new Date(dutyDate) : null

    for (const row of rows) {
      const data: any = { ...shared }

      // The PDR reminder carries an auto-generated message; leave it intact.
      if (row.isPdr) {
        delete data.emailMessage
      }

      if (newDutyDate && row.dutyDate && row.notificationDate) {
        const offset = Math.round(
          (row.notificationDate.getTime() - row.dutyDate.getTime()) / DAY_MS,
        )
        data.dutyDate = newDutyDate
        data.notificationDate = new Date(newDutyDate.getTime() + offset * DAY_MS)
      } else if (newDutyDate) {
        data.dutyDate = newDutyDate
      }

      await prisma.vehicleNotification.update({
        where: { id: row.id },
        data,
      })
    }

    return NextResponse.json({ success: true, updated: rows.length })
  } catch (error) {
    console.error('Failed to update notification batch:', error)
    return NextResponse.json({ error: 'Failed to update notification batch' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  try {
    const { batchId } = await params
    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 })
    }

    const result = await prisma.vehicleNotification.updateMany({
      where: {
        deletedAt: null,
        status: 'imported',
        OR: [{ dutyBatchId: batchId }, { pdrReminderFor: batchId }],
      },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true, deleted: result.count })
  } catch (error) {
    console.error('Failed to delete notification batch:', error)
    return NextResponse.json({ error: 'Failed to delete notification batch' }, { status: 500 })
  }
}
