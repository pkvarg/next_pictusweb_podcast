import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, items } = body

    if (!organizationId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'OrganizationId and items array are required' },
        { status: 400 }
      )
    }

    // Get organization by ID
    const org = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Bulk create items
    const createdItems = await Promise.all(
      items.map((item: any) =>
        prisma.notificationChannelOption.create({
          data: {
            label: item.label,
            sortOrder: item.sortOrder,
            organizationId: org.id,
            isActive: true,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      imported: createdItems.length,
      items: createdItems,
    })
  } catch (error) {
    console.error('Failed to bulk import notification channels:', error)
    return NextResponse.json(
      { error: 'Failed to import notification channels' },
      { status: 500 }
    )
  }
}
