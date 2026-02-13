import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeDeleted = searchParams.get('includeDeleted') === 'true'

    const whereClause: any = {}

    if (!includeDeleted) {
      whereClause.deletedAt = null
    }

    const organizations = await prisma.organization.findMany({
      where: whereClause,
      include: {
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
    const { name, mainContact, parentOrganizationId, tier } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        mainContact,
        parentOrganizationId: parentOrganizationId || null,
        tier: tier || null,
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

    return NextResponse.json({ organization }, { status: 201 })
  } catch (error) {
    console.error('Failed to create organization:', error)
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, mainContact, parentOrganizationId, tier } = body

    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        name,
        mainContact,
        parentOrganizationId: parentOrganizationId || null,
        tier: tier || null,
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
