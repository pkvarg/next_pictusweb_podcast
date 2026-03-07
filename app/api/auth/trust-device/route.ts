import { NextRequest, NextResponse } from 'next/server'

const TRUST_DAYS = 10

// Sets the device trust token as an HttpOnly cookie so JS cannot read it.
// Called by the frontend after a successful verify-2fa with trustDevice=true.
export async function POST(request: NextRequest) {
  try {
    const { deviceToken } = await request.json()

    if (!deviceToken) {
      return NextResponse.json({ error: 'deviceToken is required' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })

    response.cookies.set('__device_trust', deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TRUST_DAYS * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Trust device error:', error)
    return NextResponse.json({ error: 'Failed to set device trust' }, { status: 500 })
  }
}
