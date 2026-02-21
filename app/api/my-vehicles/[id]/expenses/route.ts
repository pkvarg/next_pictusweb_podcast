import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.isFleetManager) {
      return NextResponse.json({ error: 'Forbidden - Fleet Manager access required' }, { status: 403 })
    }

    // Verify vehicle belongs to user's organization
    const vehicle = await prisma.myVehicle.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: session.user.organization,
        deletedAt: null,
      },
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const expenses = await prisma.myVehicleExpense.findMany({
      where: {
        vehicleId: resolvedParams.id,
        deletedAt: null,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await params

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.isFleetManager) {
      return NextResponse.json({ error: 'Forbidden - Fleet Manager access required' }, { status: 403 })
    }

    // Verify vehicle belongs to user's organization
    const vehicle = await prisma.myVehicle.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: session.user.organization,
        deletedAt: null,
      },
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const body = await request.json()
    const { item, cost, date, note, link } = body

    if (!item || !cost || !date) {
      return NextResponse.json(
        { error: 'Item, cost, and date are required' },
        { status: 400 }
      )
    }

    const expense = await prisma.myVehicleExpense.create({
      data: {
        vehicleId: resolvedParams.id,
        organizationId: vehicle.organizationId,
        item,
        cost: parseFloat(cost),
        date: new Date(date),
        note: note || null,
        link: link || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
