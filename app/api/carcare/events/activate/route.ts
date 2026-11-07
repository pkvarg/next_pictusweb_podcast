import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { canModifyVehicle } from '@/lib/carcare/garage'
import { activateTemplate } from '@/lib/carcare/events'

// POST /api/carcare/events/activate
// Body: { vehicleId, templateKey, name?, dueDate?, dueMileage?, responsibleUserId? }
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  if (!body.vehicleId || !body.templateKey) {
    return NextResponse.json({ error: 'vehicleId and templateKey are required' }, { status: 400 })
  }

  const result = await prisma.$transaction(async (tx) => {
    if (!(await canModifyVehicle(tx, session.userId, body.vehicleId))) return null
    return activateTemplate(tx, {
      vehicleId: body.vehicleId,
      templateKey: body.templateKey,
      name: body.name,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      dueMileage: body.dueMileage ?? null,
      responsibleUserId: body.responsibleUserId ?? null,
    })
  })
  if (!result) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return NextResponse.json(result, { status: result.created ? 201 : 200 })
}
