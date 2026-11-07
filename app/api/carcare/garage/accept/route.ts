import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { acceptInvitation } from '@/lib/carcare/garage'

// POST /api/carcare/garage/accept — the signed-in user accepts an invitation by token.
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { token?: string }
  if (!body.token) return NextResponse.json({ error: 'token is required' }, { status: 400 })

  try {
    await prisma.$transaction((tx) => acceptInvitation(tx, body.token!, session.userId))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not accept invitation' },
      { status: 400 },
    )
  }
  return NextResponse.json({ ok: true })
}
