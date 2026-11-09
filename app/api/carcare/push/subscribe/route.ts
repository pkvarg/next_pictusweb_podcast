import { NextRequest, NextResponse } from 'next/server'
import { Channel } from '@prisma/client'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'

// POST /api/carcare/push/subscribe — store a browser push subscription for the user.
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as {
    endpoint?: string
    keys?: { p256dh?: string; auth?: string }
  }
  const endpoint = body.endpoint
  const p256dh = body.keys?.p256dh
  const auth = body.keys?.auth
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'endpoint and keys are required' }, { status: 400 })
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: session.userId, endpoint, p256dh, auth },
    update: { userId: session.userId, p256dh, auth },
  })

  // A stored subscription is the recipient's consent to receive push, so opt them in.
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { channelOptIns: true },
  })
  if (user && !user.channelOptIns.includes(Channel.PUSH)) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { channelOptIns: { set: [...user.channelOptIns, Channel.PUSH] } },
    })
  }

  return NextResponse.json({ ok: true })
}
