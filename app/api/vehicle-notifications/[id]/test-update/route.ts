import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status, clearSentAt, clearConfirmedAt, clearEmailSentAt, clearSmsSentAt } = await request.json()
    const resolvedParams = await params
    const notificationId = parseInt(resolvedParams.id)

    if (isNaN(notificationId)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    
    if (status) {
      updateData.status = status
    }
    
    if (clearSentAt || clearEmailSentAt) {
      updateData.emailSentAt = null
    }
    
    if (clearSentAt || clearSmsSentAt) {
      updateData.smsSentAt = null
    }
    
    if (clearConfirmedAt) {
      updateData.confirmedAt = null
    }

    const updatedNotification = await prisma.vehicleNotification.update({
      where: {
        id: notificationId
      },
      data: updateData
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error('Failed to update vehicle notification:', error)
    return NextResponse.json(
      { error: 'Failed to update vehicle notification' },
      { status: 500 }
    )
  }
}