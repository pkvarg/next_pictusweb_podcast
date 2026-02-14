import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { error: 'OrganizationId parameter is required' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      isActive: true,
      organizationId: organizationId,
    }

    const options = await prisma.notificationChannelOption.findMany({
      where: whereClause,
      include: {
        organizationRelation: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return NextResponse.json({ options })
  } catch (error) {
    console.error('Failed to fetch notification channel options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification channel options' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, label, sortOrder } = body

    if (!organizationId || !label) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const option = await prisma.notificationChannelOption.create({
      data: {
        organizationId: organizationId,
        label,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
    })

    return NextResponse.json({ option }, { status: 201 })
  } catch (error) {
    console.error('Failed to create notification channel option:', error)
    return NextResponse.json(
      { error: 'Failed to create notification channel option' },
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

    const option = await prisma.notificationChannelOption.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ option })
  } catch (error) {
    console.error('Failed to update notification channel option:', error)
    return NextResponse.json(
      { error: 'Failed to update notification channel option' },
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

    await prisma.notificationChannelOption.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete notification channel option:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification channel option' },
      { status: 500 }
    )
  }
}
