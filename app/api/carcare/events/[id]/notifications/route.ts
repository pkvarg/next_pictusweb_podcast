import { NextRequest, NextResponse } from 'next/server'
import { NotificationStage, Channel } from '@prisma/client'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { canModifyVehicle } from '@/lib/carcare/garage'

const STAGES = new Set(Object.values(NotificationStage))
const CHANNELS = new Set(Object.values(Channel))

interface RuleInput {
  stage: NotificationStage
  leadDays?: number
  channels?: Channel[]
  repeatUntilActioned?: boolean
  repeatEveryDays?: number | null
}

// PUT /api/carcare/events/[id]/notifications — replace the per-event notification rules
// and the per-event recipient exclusions.
// Body: { rules: RuleInput[], excludedRecipientIds?: string[] }
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const { id } = await params
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as {
    rules?: RuleInput[]
    excludedRecipientIds?: string[]
  }
  const rules = (body.rules ?? []).filter((r) => STAGES.has(r.stage))

  const ok = await prisma.$transaction(async (tx) => {
    const event = await tx.recurringEvent.findFirst({
      where: { id, deletedAt: null },
      select: { vehicleId: true },
    })
    if (!event) return 'not-found'
    if (!(await canModifyVehicle(tx, session.userId, event.vehicleId))) return 'forbidden'

    if (body.excludedRecipientIds !== undefined) {
      const ids = [...new Set(body.excludedRecipientIds.filter((x) => typeof x === 'string'))]
      await tx.eventRecipientExclusion.deleteMany({ where: { recurringEventId: id } })
      for (const userId of ids) {
        await tx.eventRecipientExclusion.create({ data: { recurringEventId: id, userId } })
      }
    }

    await tx.notificationRule.deleteMany({ where: { recurringEventId: id } })
    for (const r of rules) {
      await tx.notificationRule.create({
        data: {
          organizationId: session.organizationId!,
          recurringEventId: id,
          stage: r.stage,
          leadDays: Math.max(0, Math.round(r.leadDays ?? 0)),
          channels: (r.channels ?? []).filter((c) => CHANNELS.has(c)),
          repeatUntilActioned: !!r.repeatUntilActioned,
          repeatEveryDays: r.repeatEveryDays ?? null,
        },
      })
    }

    return 'ok'
  })

  if (ok === 'ok') return NextResponse.json({ ok: true })
  return NextResponse.json({ error: ok }, { status: ok === 'not-found' ? 404 : 403 })
}
