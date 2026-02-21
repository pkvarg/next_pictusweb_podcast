import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeDeleted = searchParams.get('includeDeleted') === 'true'
    const id = searchParams.get('id')

    const whereClause: any = {}

    if (id) {
      whereClause.id = id
    }

    if (!includeDeleted) {
      whereClause.deletedAt = null
    }

    const organizations = await prisma.organization.findMany({
      where: whereClause,
      include: {
        tierRelation: {
          select: {
            id: true,
            name: true,
            usersLimit: true,
            vehiclesLimit: true,
            notificationsLimit: true,
            templatesLimit: true,
            notificationTypesLimit: true,
          }
        },
        parentOrganization: {
          select: {
            id: true,
            name: true,
          },
        },
        childOrganizations: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Failed to fetch organizations:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, mainContact, parentOrganizationId, tierId, usersLimit, vehiclesLimit, notificationsLimit, templatesLimit, notificationTypesLimit, purchasedVehicles, hiddenFromPictusaci } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        mainContact,
        parentOrganizationId: parentOrganizationId || null,
        tierId: tierId || null,
        usersLimit: usersLimit != null ? Number(usersLimit) : null,
        vehiclesLimit: vehiclesLimit != null ? Number(vehiclesLimit) : null,
        notificationsLimit: notificationsLimit != null ? Number(notificationsLimit) : null,
        templatesLimit: templatesLimit != null ? Number(templatesLimit) : null,
        notificationTypesLimit: notificationTypesLimit != null ? Number(notificationTypesLimit) : null,
        purchasedVehicles: purchasedVehicles != null ? Number(purchasedVehicles) : null,
        hiddenFromPictusaci: hiddenFromPictusaci === true,
      },
      include: {
        tierRelation: {
          select: {
            id: true,
            name: true,
            usersLimit: true,
            vehiclesLimit: true,
            notificationsLimit: true,
            templatesLimit: true,
            notificationTypesLimit: true,
          }
        },
        parentOrganization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ organization }, { status: 201 })
  } catch (error) {
    console.error('Failed to create organization:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, mainContact, parentOrganizationId, tierId, usersLimit, vehiclesLimit, notificationsLimit, templatesLimit, notificationTypesLimit, purchasedVehicles, hiddenFromPictusaci } = body

    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // Convert empty strings / undefined to null for limit fields
    const toNullableInt = (val: any) => (val === '' || val === undefined || val === null) ? null : Number(val)

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        name,
        mainContact,
        parentOrganizationId: parentOrganizationId || null,
        tierId: tierId || null,
        usersLimit: toNullableInt(usersLimit),
        vehiclesLimit: toNullableInt(vehiclesLimit),
        notificationsLimit: toNullableInt(notificationsLimit),
        templatesLimit: toNullableInt(templatesLimit),
        notificationTypesLimit: toNullableInt(notificationTypesLimit),
        purchasedVehicles: toNullableInt(purchasedVehicles),
        ...(hiddenFromPictusaci !== undefined && { hiddenFromPictusaci: hiddenFromPictusaci === true }),
      },
      include: {
        parentOrganization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Failed to update organization:', error)
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const hard = searchParams.get('hard') === 'true'

    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    if (hard) {
      // Hard delete - permanently remove
      await prisma.organization.delete({
        where: { id },
      })
    } else {
      // Soft delete - set deletedAt
      await prisma.organization.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete organization:', error)
    return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 })
  }
}
