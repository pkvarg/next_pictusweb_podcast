import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { checkNotificationLimit } from '@/lib/notificationLimits'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sourceBatchId, newDutyDate, editedData, customIntervals } = body

    if (!sourceBatchId || !newDutyDate) {
      return NextResponse.json(
        { error: 'sourceBatchId and newDutyDate are required' },
        { status: 400 },
      )
    }

    // Fetch original duty notifications (excluding PDR reminder)
    const originalNotifications = await prisma.vehicleNotification.findMany({
      where: {
        dutyBatchId: sourceBatchId,
        isPdr: false,
      },
      orderBy: { notificationDate: 'asc' },
    })

    if (originalNotifications.length === 0) {
      return NextResponse.json({ error: 'No notifications found for this batch' }, { status: 404 })
    }

    // Fetch original PDR reminder (if exists)
    const originalPdrReminder = await prisma.vehicleNotification.findFirst({
      where: {
        pdrReminderFor: sourceBatchId,
        isPdr: true,
      },
    })

    // Use custom intervals if provided, otherwise calculate from original notifications
    let intervals: number[] = []
    if (customIntervals && Array.isArray(customIntervals) && customIntervals.length > 0) {
      intervals = customIntervals
      console.log('[RENEWAL] Using custom intervals:', intervals)
    } else {
      // Calculate intervals used
      for (const notif of originalNotifications) {
        if (notif.notificationDate && notif.dutyDate) {
          const diffMs = notif.notificationDate.getTime() - notif.dutyDate.getTime()
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
          intervals.push(diffDays)
        }
      }
      console.log('[RENEWAL] Calculated intervals from original:', intervals)
    }

    // Check notification limit before creating
    const totalToCreate = intervals.length + (originalPdrReminder ? 1 : 0)
    const orgId = originalNotifications[0].organizationId
    if (orgId) {
      const limitCheck = await checkNotificationLimit(orgId, totalToCreate, session?.user?.email || undefined)
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { error: limitCheck.reason, blocked: limitCheck.blocked, limitReached: limitCheck.limitReached },
          { status: 403 }
        )
      }
    }

    // Generate new dutyBatchId
    const newDutyBatchId = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Parse new duty date
    const newDutyDateObj = new Date(newDutyDate)

    // Get base data from first notification
    const baseNotif = originalNotifications[0]

    // Merge with edited data if provided
    const baseData = {
      vehicleId: editedData?.vehicleId || baseNotif.myVehicleId || null,
      vehicleRegistration: editedData?.vehicleRegistration || baseNotif.vehicleRegistration,
      notificationType: editedData?.notificationType || baseNotif.notificationType,
      notificationChannel: editedData?.notificationChannel || baseNotif.notificationChannel,
      personName: editedData?.personName || baseNotif.personName,
      email: editedData?.email || baseNotif.email,
      phoneNumber: editedData?.phoneNumber || baseNotif.phoneNumber,
      emailMessage: editedData?.emailMessage || baseNotif.emailMessage,
      organizationId: baseNotif.organizationId,
      userId: baseNotif.userId,
    }

    // Create new notifications with same intervals
    const createdNotifications = []

    for (const interval of intervals) {
      const newNotificationDate = new Date(newDutyDateObj)
      newNotificationDate.setDate(newNotificationDate.getDate() + interval)

      const newNotification = await prisma.vehicleNotification.create({
        data: {
          dutyBatchId: newDutyBatchId,
          renewedFromBatchId: sourceBatchId,
          isPdr: false,
          organizationId: baseData.organizationId,
          vehicleRegistration: baseData.vehicleRegistration,
          notificationType: baseData.notificationType,
          notificationChannel: baseData.notificationChannel,
          personName: baseData.personName,
          email: baseData.email,
          phoneNumber: baseData.phoneNumber,
          emailMessage: baseData.emailMessage,
          dutyDate: newDutyDateObj,
          notificationDate: newNotificationDate,
          status: 'pending',
          userId: baseData.userId,
          myVehicleId: baseData.vehicleId,
        },
      })

      createdNotifications.push(newNotification)
    }

    // If original had PDR reminder, create new one
    let newPdrReminder = null
    if (originalPdrReminder) {
      const pdrReminderDate = new Date(newDutyDateObj)
      pdrReminderDate.setDate(pdrReminderDate.getDate() + 1) // 1 day after duty

      newPdrReminder = await prisma.vehicleNotification.create({
        data: {
          dutyBatchId: null,
          renewedFromBatchId: sourceBatchId,
          isPdr: true,
          pdrReminderFor: newDutyBatchId,
          organizationId: baseData.organizationId,
          vehicleRegistration: baseData.vehicleRegistration,
          notificationType: baseData.notificationType,
          notificationChannel: baseData.notificationChannel,
          personName: baseData.personName,
          email: baseData.email,
          phoneNumber: baseData.phoneNumber,
          emailMessage: `${baseData.notificationType} pre ${baseData.vehicleRegistration} bola včera. Naplánujete ďalšiu?`,
          dutyDate: newDutyDateObj,
          notificationDate: pdrReminderDate,
          status: 'pending',
          userId: baseData.userId,
          myVehicleId: baseData.vehicleId,
        },
      })

      // Mark original PDR reminder as completed (soft delete)
      await prisma.vehicleNotification.update({
        where: { id: originalPdrReminder.id },
        data: { deletedAt: new Date() },
      })
    }

    return NextResponse.json(
      {
        success: true,
        newDutyBatchId,
        createdNotifications,
        newPdrReminder,
        count: createdNotifications.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating renewal:', error)
    return NextResponse.json({ error: 'Failed to create renewal' }, { status: 500 })
  }
}
