import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

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
        prisma.notificationTypeOption.create({
          data: {
            label: item.label,
            sortOrder: item.sortOrder,
            organizationId: org.id,
            isActive: true,
            isPdr: item.isPdr || false,
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
    console.error('Failed to bulk import notification types:', error)
    return NextResponse.json(
      { error: 'Failed to import notification types' },
      { status: 500 }
    )
  }
}
