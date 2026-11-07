import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { canModifyVehicle } from '@/lib/carcare/garage'
import { completeOccurrence } from '@/lib/carcare/completion'

// POST /api/carcare/occurrences/:id/complete
// Body: { date?, mileage?, providerId?, cost?, currency?, notes? }
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const result = await prisma.$transaction(async (tx) => {
    const occ = await tx.eventOccurrence.findUnique({ where: { id }, select: { vehicleId: true } })
    if (!occ) return { code: 404 as const }
    if (!(await canModifyVehicle(tx, session.userId, occ.vehicleId))) return { code: 403 as const }
    const updated = await completeOccurrence(tx, id, {
      date: body.date ? new Date(body.date) : new Date(),
      mileage: body.mileage ?? null,
      providerId: body.providerId ?? null,
      cost: body.cost ?? null,
      currency: body.currency ?? null,
      notes: body.notes ?? null,
    })
    return { code: 200 as const, occurrence: updated }
  })

  if (result.code === 404)
    return NextResponse.json({ error: 'Occurrence not found' }, { status: 404 })
  if (result.code === 403) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json({ occurrence: result.occurrence })
}
