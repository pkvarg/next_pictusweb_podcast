import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { listProviders, createProvider, type ProviderInput } from '@/lib/carcare/providers'

// GET /api/carcare/providers — providers (service shops, insurers…) for the garage.
export async function GET() {
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const providers = await prisma.$transaction((tx) => listProviders(tx, session.organizationId!))
  return NextResponse.json({ providers, canModify: session.canModify })
}

// POST /api/carcare/providers — add a provider (not for read-only viewers).
export async function POST(request: NextRequest) {
  if (!sameOriginOk(request)) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  const session = await resolveCarCareSession()
  if (!session?.organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.canModify) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await request.json().catch(() => ({}))) as Partial<ProviderInput>
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const provider = await prisma.$transaction((tx) =>
    createProvider(tx, session.organizationId!, {
      name: body.name!.trim(),
      category: body.category ?? null,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      website: body.website?.trim() || null,
      bookingUrl: body.bookingUrl?.trim() || null,
      address: body.address?.trim() || null,
      notes: body.notes?.trim() || null,
    }),
  )
  return NextResponse.json({ provider }, { status: 201 })
}
