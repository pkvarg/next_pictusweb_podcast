import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { checkNotificationLimit } from '@/lib/notificationLimits'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received notification creation request:', JSON.stringify(body, null, 2))

    const {
      templateId,
      vehicleId,
      dutyDate,
      notificationDate,
      notificationType,
      notificationChannel,
      emailMessage,
      personName,
      email,
      phoneNumber,
      organizationId,
      dutyBatchId,
      isPdr,
      pdrReminderFor,
    } = body

    if (!dutyDate) {
      return NextResponse.json(
        { error: 'Duty date is required' },
        { status: 400 }
      )
    }

    // Check notification limit before creating
    if (organizationId) {
      const limitCheck = await checkNotificationLimit(organizationId, 1, email || undefined)
      if (!limitCheck.allowed) {
        return NextResponse.json(
          { error: limitCheck.reason, blocked: limitCheck.blocked, limitReached: limitCheck.limitReached },
          { status: 403 }
        )
      }

      // FREE tier can only use the Email channel
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: { tierRelation: { select: { name: true } } },
      })
      if (org?.tierRelation?.name === 'FREE' && notificationChannel?.toLowerCase() !== 'email') {
        return NextResponse.json(
          { error: 'FREE tier only supports Email channel' },
          { status: 403 }
        )
      }
    }

    let notificationData: any = {
      organizationId,
      personName,
      email,
      phoneNumber,
      dutyDate: new Date(dutyDate),
      status: 'imported',
      dutyBatchId: dutyBatchId || null,
      isPdr: isPdr || false,
      pdrReminderFor: pdrReminderFor || null,
    }

    if (vehicleId) {
      console.log('[CREATE-NOTIFICATION] Looking up vehicle with ID:', vehicleId)
      const vehicle = await prisma.myVehicle.findUnique({
        where: { id: vehicleId },
        include: { user: true },
      })

      if (vehicle) {
        console.log('[CREATE-NOTIFICATION] Found vehicle:', {
          id: vehicle.id,
          registration: vehicle.registration,
          type: vehicle.type,
        })
        notificationData.vehicleRegistration = vehicle.registration
        notificationData.myVehicleId = vehicle.id
        notificationData.userId = vehicle.userId
        notificationData.organizationId = vehicle.organizationId
        notificationData.personName = personName || (vehicle.user ? `${vehicle.user.firstName || ''} ${vehicle.user.lastName || ''}`.trim() : null) || null
        notificationData.email = email || vehicle.user?.email || null
        console.log('[CREATE-NOTIFICATION] Set vehicleRegistration to:', notificationData.vehicleRegistration)
      } else {
        console.log('[CREATE-NOTIFICATION] Vehicle not found with ID:', vehicleId)
      }
    } else {
      console.log('[CREATE-NOTIFICATION] No vehicleId provided in request')
    }

    // Always use values from body (formData)
    // Template is only used as a fallback for empty values
    notificationData.notificationType = notificationType
    notificationData.notificationChannel = notificationChannel
    notificationData.emailMessage = emailMessage
    notificationData.notificationDate = notificationDate && notificationDate.trim() !== '' ? new Date(notificationDate) : null

    // If template is provided and body values are empty, use template as fallback
    if (templateId) {
      const template = await prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      })

      if (template) {
        // Only use template values if body values are empty
        if (!notificationData.notificationType && template.notificationType) {
          notificationData.notificationType = template.notificationType
        }
        if (!notificationData.notificationChannel && template.notificationChannel) {
          notificationData.notificationChannel = template.notificationChannel
        }
        if (!notificationData.emailMessage && template.emailMessage) {
          notificationData.emailMessage = template.emailMessage
        }
      }
    }

    console.log('Creating notification with data:', JSON.stringify(notificationData, null, 2))

    const notification = await prisma.vehicleNotification.create({
      data: notificationData,
    })

    console.log('Created notification:', JSON.stringify(notification, null, 2))

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
