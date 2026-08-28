import { NextRequest, NextResponse } from 'next/server'

/**
 * Deprecated. This endpoint previously revealed whether an account existed (and
 * leaked the user's name), which allowed user enumeration. The password-reset
 * flow no longer uses it; it now always returns an identical, non-revealing
 * response.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json({ ok: true }, { status: 200 })
}
