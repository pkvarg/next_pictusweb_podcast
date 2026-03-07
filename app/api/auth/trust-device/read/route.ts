import { NextRequest, NextResponse } from 'next/server'

// Returns the raw device token from the HttpOnly cookie so the client-side
// login page can forward it to check-device-trust without being able to
// read the cookie value directly from JS.
export async function GET(request: NextRequest) {
  const deviceToken = request.cookies.get('__device_trust')?.value || null
  return NextResponse.json({ deviceToken })
}
