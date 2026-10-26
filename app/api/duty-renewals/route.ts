import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizationIdParam = searchParams.get('organizationId')
    const statusFilter = searchParams.get('status') || 'pending' // 'pending' | 'completed' | 'all'

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        organizationId: true,
        organizationRelation: {
          select: { name: true },
        },
      },
    })

    const isPictusaciUser = user?.organizationRelation?.name === 'PICTUSACI'
    let organizationId = organizationIdParam || user?.organizationId

    if (!organizationId && !isPictusaciUser) {
      return NextResponse.json({ error: 'No organization assigned' }, { status: 400 })
    }

    // Build where clause for PDR reminders
    const pdrWhereClause: any = {
      isPdr: true,
      deletedAt: statusFilter === 'dismissed' ? { not: null } : null,
    }

    // Filter by organization unless PICTUSACI user viewing all
    if (!isPictusaciUser || (organizationIdParam && organizationIdParam !== 'all')) {
      pdrWhereClause.organizationId = organizationId
    } else if (isPictusaciUser && (!organizationIdParam || organizationIdParam === 'all')) {
      // Exclude hidden organizations for PICTUSACI "all" queries
      pdrWhereClause.organization = { hiddenFromPictusaci: false }
    }

    // Fetch all PDR reminder notifications
    const pdrReminders = await prisma.vehicleNotification.findMany({
      where: pdrWhereClause,
      include: {
        myVehicle: {
          select: {
            registration: true,
            type: true,
            organizationRelation: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { dutyDate: 'desc' },
    })

    // Group by pdrReminderFor (which is the dutyBatchId of the original duty)
    const dutyBatches: any[] = []

    for (const pdrReminder of pdrReminders) {
      if (!pdrReminder.pdrReminderFor) continue

      // Skip if already processed
      if (dutyBatches.some((b) => b.dutyBatchId === pdrReminder.pdrReminderFor)) continue

      // Check status filter
      const isPending = !pdrReminder.deletedAt
      const isCompleted = !!pdrReminder.deletedAt

      if (statusFilter === 'pending' && !isPending) continue
      if (statusFilter === 'completed' && !isCompleted) continue

      // Fetch all notifications for this duty batch
      const allNotifications = await prisma.vehicleNotification.findMany({
        where: {
          dutyBatchId: pdrReminder.pdrReminderFor,
          isPdr: false, // Exclude PDR reminders
        },
        orderBy: { notificationDate: 'asc' },
      })

      if (allNotifications.length === 0) continue

      // Calculate intervals used (difference in days between notificationDate and dutyDate)
      const intervalsUsed: number[] = []
      for (const notif of allNotifications) {
        if (notif.notificationDate && notif.dutyDate) {
          const diffMs = notif.notificationDate.getTime() - notif.dutyDate.getTime()
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
          intervalsUsed.push(diffDays)
        }
      }

      // Get the original duty date (from first notification)
      const originalDutyDate = allNotifications[0]?.dutyDate || null

      dutyBatches.push({
        dutyBatchId: pdrReminder.pdrReminderFor,
        vehicleRegistration:
          pdrReminder.vehicleRegistration || allNotifications[0]?.vehicleRegistration || 'Unknown',
        notificationType:
          pdrReminder.notificationType || allNotifications[0]?.notificationType || 'Unknown',
        originalDutyDate: originalDutyDate?.toISOString() || null,
        allNotifications,
        intervalsUsed: intervalsUsed.sort((a, b) => a - b),
        isPdrType: true,
        pdrReminder,
        status: statusFilter === 'dismissed' ? 'dismissed' : isPending ? 'pending' : 'completed',
        dismissedAt: pdrReminder.deletedAt ? pdrReminder.deletedAt.toISOString() : null,
        organizationName: pdrReminder.myVehicle?.organizationRelation?.name || null,
      })
    }

    return NextResponse.json({ dutyBatches })
  } catch (error) {
    console.error('Error fetching duty renewals:', error)
    return NextResponse.json({ error: 'Failed to fetch duty renewals' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dutyBatchId } = await request.json().catch(() => ({ dutyBatchId: null }))

    if (!dutyBatchId || typeof dutyBatchId !== 'string') {
      return NextResponse.json({ error: 'dutyBatchId is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        organizationId: true,
        organizationRelation: {
          select: { name: true },
        },
      },
    })

    const isPictusaciUser = user?.organizationRelation?.name === 'PICTUSACI'

    const where: any = {
      isPdr: true,
      deletedAt: null,
      pdrReminderFor: dutyBatchId,
    }

    if (!isPictusaciUser) {
      if (!user?.organizationId) {
        return NextResponse.json({ error: 'No organization assigned' }, { status: 400 })
      }
      where.organizationId = user.organizationId
    }

    const result = await prisma.vehicleNotification.updateMany({
      where,
      data: { deletedAt: new Date() },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Renewal not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, dismissed: result.count })
  } catch (error) {
    console.error('Error dismissing duty renewal:', error)
    return NextResponse.json({ error: 'Failed to dismiss renewal' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dutyBatchId } = await request.json().catch(() => ({ dutyBatchId: null }))

    if (!dutyBatchId || typeof dutyBatchId !== 'string') {
      return NextResponse.json({ error: 'dutyBatchId is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        organizationId: true,
        organizationRelation: {
          select: { name: true },
        },
      },
    })

    const isPictusaciUser = user?.organizationRelation?.name === 'PICTUSACI'

    const where: any = {
      isPdr: true,
      deletedAt: { not: null },
      pdrReminderFor: dutyBatchId,
    }

    if (!isPictusaciUser) {
      if (!user?.organizationId) {
        return NextResponse.json({ error: 'No organization assigned' }, { status: 400 })
      }
      where.organizationId = user.organizationId
    }

    const result = await prisma.vehicleNotification.updateMany({
      where,
      data: { deletedAt: null },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Dismissed renewal not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, restored: result.count })
  } catch (error) {
    console.error('Error restoring duty renewal:', error)
    return NextResponse.json({ error: 'Failed to restore renewal' }, { status: 500 })
  }
}
