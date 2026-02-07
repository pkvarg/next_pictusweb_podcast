import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * POST /api/vehicle-notifications/link-vehicles
 * Links VehicleNotifications to MyVehicles based on matching registration and organization
 * Can be run manually or scheduled to keep links up to date
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins or fleet managers can trigger linking
    if (session.user.role !== 'ADMIN' && !session.user.isFleetManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all notifications that don't have a vehicle link yet
    const unlinkedNotifications = await prisma.vehicleNotification.findMany({
      where: {
        myVehicleId: null,
        vehicleRegistration: { not: null },
        company: { not: null },
      },
      select: {
        id: true,
        vehicleRegistration: true,
        company: true,
      },
    })

    let linkedCount = 0
    let skippedCount = 0

    // Try to link each notification
    for (const notification of unlinkedNotifications) {
      if (!notification.vehicleRegistration || !notification.company) continue

      // Find matching vehicle
      const vehicle = await prisma.myVehicle.findFirst({
        where: {
          registration: notification.vehicleRegistration,
          organization: notification.company,
          deletedAt: null,
        },
        select: {
          id: true,
        },
      })

      if (vehicle) {
        // Link the notification to the vehicle
        await prisma.vehicleNotification.update({
          where: { id: notification.id },
          data: { myVehicleId: vehicle.id },
        })
        linkedCount++
      } else {
        skippedCount++
      }
    }

    return NextResponse.json({
      message: 'Vehicle linking completed',
      linkedCount,
      skippedCount,
      totalProcessed: unlinkedNotifications.length,
    })
  } catch (error) {
    console.error('Error linking vehicles:', error)
    return NextResponse.json({ error: 'Failed to link vehicles' }, { status: 500 })
  }
}
