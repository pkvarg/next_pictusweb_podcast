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

    const options = await prisma.notificationChannelOption.findMany({
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
    let { organization, label, value, sortOrder } = body

    // Auto-generate value from label if not provided
    if (!value && label) {
      value = label
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim()
    }

    if (!organization || !label) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const option = await prisma.notificationChannelOption.create({
      data: {
        organization,
        label,
        value,
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
    let { id, label, value, sortOrder, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing option ID' }, { status: 400 })
    }

    // Auto-generate value from label if label is provided and value is not
    if (label && !value) {
      value = label
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim()
    }

    const updateData: any = {}
    if (label !== undefined) updateData.label = label
    if (value !== undefined) updateData.value = value
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
