import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { checkTierLimit, TierLimitError } from '@/lib/tier-limits'

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

    const options = await prisma.notificationTypeOption.findMany({
      where: {
        organizationId: organizationId,
        isActive: true,
        deletedAt: null,
      },
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
    const { organizationId, label, sortOrder, isPdr } = body

    console.log('Received POST request:', { organizationId, label, sortOrder, isPdr })

    if (!organizationId || !label) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          received: { organizationId, label },
          missing: {
            organizationId: !organizationId,
            label: !label,
          }
        },
        { status: 400 }
      )
    }

    // Check tier limit
    try {
      await checkTierLimit(organizationId, 'notificationTypes')
    } catch (error) {
      if (error instanceof TierLimitError) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      throw error
    }

    const option = await prisma.notificationTypeOption.create({
      data: {
        organizationId,
        label,
        isPdr: isPdr || false,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
      include: {
        organizationRelation: {
          select: {
            id: true,
            name: true,
          }
        }
      }
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
    const { id, label, sortOrder, isActive, isPdr } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing option ID' }, { status: 400 })
    }

    const updateData: any = {}
    if (label !== undefined) updateData.label = label
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder)
    if (isActive !== undefined) updateData.isActive = isActive
    if (isPdr !== undefined) updateData.isPdr = isPdr

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
