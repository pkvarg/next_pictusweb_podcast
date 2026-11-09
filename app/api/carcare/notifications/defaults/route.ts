import { NextRequest, NextResponse } from 'next/server'
import { NotificationStage, Channel } from '@prisma/client'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'

const STAGES = new Set(Object.values(NotificationStage))
const CHANNELS = new Set(Object.values(Channel))

interface RuleInput {
  stage: NotificationStage
  leadDays?: number
  channels?: Channel[]
  repeatUntilActioned?: boolean
  repeatEveryDays?: number | null
}

const memberName = (u: { firstName: string | null; lastName: string | null; email: string }) =>
  [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email

// GET /api/carcare/notifications/defaults — the org-wide default notification rules
// (recurringEventId = null), the central recipient list, the garage member pool, and
// the user's account-wide quiet hours.
export async function GET() {
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [rules, recipients, memberships, me, org] = await Promise.all([
    prisma.notificationRule.findMany({
      where: { organizationId: session.organizationId, recurringEventId: null },
      orderBy: { stage: 'asc' },
    }),
    prisma.notificationRecipient.findMany({
      where: { organizationId: session.organizationId },
      select: { userId: true },
    }),
    prisma.garageMembership.findMany({
      where: { organizationId: session.organizationId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
    prisma.organization.findUnique({
      where: { id: session.organizationId },
      select: { notificationSendHour: true, notificationSendMinute: true },
    }),
  ])

  const members = memberships.map((m) => ({ userId: m.userId, name: memberName(m.user) }))
  if (me && !members.some((m) => m.userId === me.id)) {
    members.unshift({ userId: me.id, name: memberName(me) })
  }

  return NextResponse.json({
    canModify: session.garageRole === 'OWNER',
    rules: rules.map((r) => ({
      stage: r.stage,
      leadDays: r.leadDays,
      channels: r.channels,
      repeatUntilActioned: r.repeatUntilActioned,
      repeatEveryDays: r.repeatEveryDays,
    })),
    members,
    recipientIds: recipients.map((r) => r.userId),
    sendTime: {
      hour: org?.notificationSendHour ?? 8,
      minute: org?.notificationSendMinute ?? 30,
    },
  })
}

// PUT /api/carcare/notifications/defaults — replace the org-wide default rules, the central
// recipient list, and the account-level send time. Owner-only (org-wide settings).
// Body: { rules: RuleInput[], recipients?: string[], sendHour?: number, sendMinute?: number }
export async function PUT(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.garageRole !== 'OWNER')
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = (await request.json().catch(() => ({}))) as {
    rules?: RuleInput[]
    recipients?: string[]
    sendHour?: number
    sendMinute?: number
  }
  const rules = (body.rules ?? []).filter((r) => STAGES.has(r.stage))

  await prisma.$transaction(async (tx) => {
    await tx.notificationRule.deleteMany({
      where: { organizationId: session.organizationId!, recurringEventId: null },
    })
    for (const r of rules) {
      await tx.notificationRule.create({
        data: {
          organizationId: session.organizationId!,
          recurringEventId: null,
          stage: r.stage,
          leadDays: Math.max(0, Math.round(r.leadDays ?? 0)),
          channels: (r.channels ?? []).filter((c) => CHANNELS.has(c)),
          repeatUntilActioned: !!r.repeatUntilActioned,
          repeatEveryDays: r.repeatEveryDays ?? null,
        },
      })
    }

    if (body.recipients !== undefined) {
      const ids = [...new Set(body.recipients.filter((x) => typeof x === 'string'))]
      const valid =
        ids.length === 0
          ? []
          : (
              await tx.user.findMany({
                where: { id: { in: ids }, organizationId: session.organizationId! },
                select: { id: true },
              })
            ).map((u) => u.id)
      const validSet = new Set(valid)
      const memberIds = (
        await tx.garageMembership.findMany({
          where: { organizationId: session.organizationId!, userId: { in: ids } },
          select: { userId: true },
        })
      ).map((m) => m.userId)
      memberIds.forEach((x) => validSet.add(x))

      await tx.notificationRecipient.deleteMany({
        where: { organizationId: session.organizationId! },
      })
      for (const userId of validSet) {
        await tx.notificationRecipient.create({
          data: { organizationId: session.organizationId!, userId },
        })
      }
    }

    if (body.sendHour !== undefined || body.sendMinute !== undefined) {
      const hour = Math.min(23, Math.max(0, Math.round(body.sendHour ?? 8)))
      const minute = body.sendMinute === 30 ? 30 : 0 // whole or half hours only
      await tx.organization.update({
        where: { id: session.organizationId! },
        data: { notificationSendHour: hour, notificationSendMinute: minute },
      })
    }
  })

  return NextResponse.json({ ok: true })
}
