import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organization = searchParams.get('organization')

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization parameter is required' },
        { status: 400 }
      )
    }

    const options = await prisma.notificationTypeOption.findMany({
      where: {
        organization: {
          equals: organization,
          mode: 'insensitive' as const,
        },
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return NextResponse.json({ options })
  } catch (error) {
    console.error('Failed to fetch notification type options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification type options' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organization, label, sortOrder } = body

    console.log('Received POST request:', { organization, label, sortOrder })

    if (!organization || !label) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          received: { organization, label },
          missing: {
            organization: !organization,
            label: !label,
          }
        },
        { status: 400 }
      )
    }

    const option = await prisma.notificationTypeOption.create({
      data: {
        organization,
        label,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
    })

    return NextResponse.json({ option }, { status: 201 })
  } catch (error) {
    console.error('Failed to create notification type option:', error)
    return NextResponse.json(
      { error: 'Failed to create notification type option' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, label, sortOrder, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing option ID' }, { status: 400 })
    }

    const updateData: any = {}
    if (label !== undefined) updateData.label = label
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder)
    if (isActive !== undefined) updateData.isActive = isActive

    const option = await prisma.notificationTypeOption.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ option })
  } catch (error) {
    console.error('Failed to update notification type option:', error)
    return NextResponse.json(
      { error: 'Failed to update notification type option' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing option ID' }, { status: 400 })
    }

    await prisma.notificationTypeOption.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete notification type option:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification type option' },
      { status: 500 }
    )
  }
}
