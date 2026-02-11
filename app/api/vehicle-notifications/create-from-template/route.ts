import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
      company,
    } = body

    if (!dutyDate) {
      return NextResponse.json(
        { error: 'Duty date is required' },
        { status: 400 }
      )
    }

    let notificationData: any = {
      company,
      personName,
      email,
      phoneNumber,
      dutyDate: new Date(dutyDate),
      status: 'imported',
    }

    if (vehicleId) {
      const vehicle = await prisma.myVehicle.findUnique({
        where: { id: vehicleId },
        include: { user: true },
      })

      if (vehicle) {
        notificationData.vehicleRegistration = vehicle.registration
        notificationData.vehicleType = vehicle.type
        notificationData.myVehicleId = vehicle.id
        notificationData.userId = vehicle.userId
        notificationData.company = vehicle.organization
        notificationData.personName = personName || (vehicle.user ? `${vehicle.user.firstName || ''} ${vehicle.user.lastName || ''}`.trim() : null) || null
        notificationData.email = email || vehicle.user?.email || null
      }
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
