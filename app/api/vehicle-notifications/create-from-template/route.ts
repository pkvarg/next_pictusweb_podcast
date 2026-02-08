import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      templateId,
      vehicleId,
      dutyDate,
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
        notificationData.personName = personName || vehicle.user?.name || null
        notificationData.email = email || vehicle.user?.email || null
      }
    }

    if (templateId) {
      const template = await prisma.notificationTemplate.findUnique({
        where: { id: templateId },
      })

      if (template) {
        notificationData.notificationType = template.notificationType
        notificationData.notificationChannel = template.notificationChannel
        notificationData.emailMessage = template.emailMessage

        if (template.daysBeforeDuty) {
          const notificationDate = new Date(dutyDate)
          notificationDate.setDate(notificationDate.getDate() - template.daysBeforeDuty)
          notificationData.notificationDate = notificationDate
        }
      }
    } else {
      const { notificationType, notificationChannel, notificationDate, emailMessage } = body

      notificationData.notificationType = notificationType
      notificationData.notificationChannel = notificationChannel
      notificationData.notificationDate = notificationDate ? new Date(notificationDate) : null
      notificationData.emailMessage = emailMessage
    }

    const notification = await prisma.vehicleNotification.create({
      data: notificationData,
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Failed to create notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
