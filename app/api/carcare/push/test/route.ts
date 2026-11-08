import { NextRequest, NextResponse } from 'next/server'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { sendPush } from '@/lib/carcare/push'

// POST /api/carcare/push/test — send a test push to the signed-in user (verification).
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sent = await sendPush(session.userId, {
      title: 'FleetSync',
      body: 'Testovacia notifikácia funguje ✔',
      url: '/carcare',
      tag: 'test',
    })
    return NextResponse.json({ ok: true, sent })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'push failed' },
      { status: 500 },
    )
  }
}
