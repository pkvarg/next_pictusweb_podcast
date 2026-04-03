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
    const organizationId = searchParams.get('organizationId')
    const notificationType = searchParams.get('notificationType')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    // Build where clause
    const whereClause: any = {
      organizationId,
    }

    if (notificationType) {
      whereClause.notificationTypeLabel = notificationType
    }

    // Fetch presets
    const presets = await prisma.dutyRenewalPreset.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    // If no presets found, return default
    if (presets.length === 0) {
      return NextResponse.json({
        presets: [{
          id: 'default',
          presetMonths: '6,12,24',
          presetLabels: '+6 mesiacov,+1 rok,+2 roky',
          defaultPresetIndex: 0,
          isDefault: true
        }]
      })
    }

    return NextResponse.json({ presets })
  } catch (error) {
    console.error('Error fetching duty renewal presets:', error)
    return NextResponse.json({ error: 'Failed to fetch presets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create/update presets
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      id,
      notificationTypeId,
      notificationTypeLabel,
      organizationId,
      presetMonths,
      presetLabels,
      defaultPresetIndex
    } = body

    if (!organizationId || !presetMonths || !presetLabels) {
      return NextResponse.json(
        { error: 'organizationId, presetMonths, and presetLabels are required' },
        { status: 400 }
      )
    }

    let preset
    if (id && id !== 'default') {
      // Update existing preset
      preset = await prisma.dutyRenewalPreset.update({
        where: { id },
        data: {
          notificationTypeId: notificationTypeId || null,
          notificationTypeLabel: notificationTypeLabel || null,
          presetMonths,
          presetLabels,
          defaultPresetIndex: defaultPresetIndex || 0,
        }
      })
    } else {
      // Create new preset
      preset = await prisma.dutyRenewalPreset.create({
        data: {
          notificationTypeId: notificationTypeId || null,
          notificationTypeLabel: notificationTypeLabel || null,
          organizationId,
          presetMonths,
          presetLabels,
          defaultPresetIndex: defaultPresetIndex || 0,
        }
      })
    }

    return NextResponse.json({ preset }, { status: id ? 200 : 201 })
  } catch (error) {
    console.error('Error creating/updating duty renewal preset:', error)
    return NextResponse.json({ error: 'Failed to save preset' }, { status: 500 })
  }
}
