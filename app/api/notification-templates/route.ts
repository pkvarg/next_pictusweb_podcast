import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organization = searchParams.get('organization')

    let whereClause = {}

    if (organization) {
      whereClause = {
        organization: {
          equals: organization,
          mode: 'insensitive' as const,
        },
        isActive: true,
      }
    } else {
      whereClause = {
        isActive: true,
      }
    }

    const templates = await prisma.notificationTemplate.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Failed to fetch notification templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organization,
      name,
      notificationType,
      notificationChannel,
      reminderIntervals,
      emailMessage,
      smsMessage,
    } = body

    if (!organization || !name || !notificationType || !notificationChannel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const template = await prisma.notificationTemplate.create({
      data: {
        organization,
        name,
        notificationType,
        notificationChannel,
        reminderIntervals: reminderIntervals || null,
        emailMessage,
        smsMessage,
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Failed to create notification template:', error)
    return NextResponse.json(
      { error: 'Failed to create notification template' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      organization,
      name,
      notificationType,
      notificationChannel,
      reminderIntervals,
      emailMessage,
      smsMessage,
      isActive,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing template ID' }, { status: 400 })
    }

    const template = await prisma.notificationTemplate.update({
      where: { id },
      data: {
        organization,
        name,
        notificationType,
        notificationChannel,
        reminderIntervals: reminderIntervals || null,
        emailMessage,
        smsMessage,
        isActive,
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Failed to update notification template:', error)
    return NextResponse.json(
      { error: 'Failed to update notification template' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing template ID' }, { status: 400 })
    }

    await prisma.notificationTemplate.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete notification template:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification template' },
      { status: 500 }
    )
  }
}
