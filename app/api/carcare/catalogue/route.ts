import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { resolveCarCareSession } from '@/lib/carcare/apiAuth'
import { searchCatalogue } from '@/lib/carcare/vehicles'

// GET /api/carcare/catalogue?q=octav — make/model catalogue search for onboarding.
export async function GET(request: NextRequest) {
  const session = await resolveCarCareSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = new URL(request.url).searchParams.get('q') ?? ''
  const results = await prisma.$transaction((tx) => searchCatalogue(tx, q))
  return NextResponse.json({ results })
}
