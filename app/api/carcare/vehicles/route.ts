import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { listAccessibleVehicleIds } from '@/lib/carcare/garage'
import { createVehicle, type VehicleInput } from '@/lib/carcare/vehicles'

export async function GET() {
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const vehicles = await prisma.$transaction(async (tx) => {
    const ids = await listAccessibleVehicleIds(tx, session.userId, session.organizationId!)
    return tx.myVehicle.findMany({ where: { id: { in: ids } }, orderBy: { createdAt: 'asc' } })
  })
  return NextResponse.json({ vehicles })
}

export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as Partial<VehicleInput>
  if (!body.registration) {
    return NextResponse.json({ error: 'registration is required' }, { status: 400 })
  }
  const vehicle = await prisma.$transaction((tx) =>
    createVehicle(tx, session.organizationId!, session.userId, body as VehicleInput),
  )
  return NextResponse.json({ vehicle }, { status: 201 })
}
