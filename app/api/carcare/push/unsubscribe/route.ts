import { NextRequest, NextResponse } from 'next/server'
import { Channel } from '@prisma/client'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'

// POST /api/carcare/push/unsubscribe — remove a browser push subscription.
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { endpoint?: string }
  if (!body.endpoint) return NextResponse.json({ error: 'endpoint is required' }, { status: 400 })

  await prisma.pushSubscription.deleteMany({
    where: { endpoint: body.endpoint, userId: session.userId },
  })

  // No devices left → drop the push opt-in so dispatch won't keep trying.
  const remaining = await prisma.pushSubscription.count({ where: { userId: session.userId } })
  if (remaining === 0) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { channelOptIns: true },
    })
    if (user?.channelOptIns.includes(Channel.PUSH)) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { channelOptIns: { set: user.channelOptIns.filter((c) => c !== Channel.PUSH) } },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
