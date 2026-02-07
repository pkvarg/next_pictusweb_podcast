import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mileageId: string }> }
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

    // Verify mileage record exists and belongs to user's organization
    const mileageRecord = await prisma.myVehicleMileage.findFirst({
      where: {
        id: resolvedParams.mileageId,
        vehicleId: resolvedParams.id,
        deletedAt: null,
      },
      include: {
        vehicle: true,
      },
    })

    if (!mileageRecord || mileageRecord.vehicle.organization !== session.user.organization) {
      return NextResponse.json({ error: 'Mileage record not found' }, { status: 404 })
    }

    // Soft delete the mileage record
    await prisma.myVehicleMileage.update({
      where: {
        id: resolvedParams.mileageId,
      },
      data: {
        deletedAt: new Date(),
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: 'Mileage record deleted successfully' })
  } catch (error) {
    console.error('Error deleting mileage record:', error)
    return NextResponse.json({ error: 'Failed to delete mileage record' }, { status: 500 })
  }
}
