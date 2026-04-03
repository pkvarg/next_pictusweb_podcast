import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
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

    // Verify expense belongs to user's organization
    const expense = await prisma.myVehicleExpense.findFirst({
      where: {
        id: resolvedParams.expenseId,
        vehicleId: resolvedParams.id,
        organizationId: session.user.organization,
        deletedAt: null,
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    const body = await request.json()
    const { item, cost, date, note, link } = body

    if (!item || !cost || !date) {
      return NextResponse.json(
        { error: 'Item, cost, and date are required' },
        { status: 400 }
      )
    }

    const updated = await prisma.myVehicleExpense.update({
      where: { id: resolvedParams.expenseId },
      data: {
        item,
        cost: parseFloat(cost),
        date: new Date(date),
        note: note || null,
        link: link || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
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

    // Verify expense belongs to user's organization
    const expense = await prisma.myVehicleExpense.findFirst({
      where: {
        id: resolvedParams.expenseId,
        vehicleId: resolvedParams.id,
        organizationId: session.user.organization,
        deletedAt: null,
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Soft delete the expense
    await prisma.myVehicleExpense.update({
      where: {
        id: resolvedParams.expenseId,
      },
      data: {
        deletedAt: new Date(),
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
