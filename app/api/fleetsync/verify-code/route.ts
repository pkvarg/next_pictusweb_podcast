import { NextRequest, NextResponse } from 'next/server'

// PLACEHOLDER: Real verification will be implemented later.
// For now, accepts "000000" as valid code for both email and phone.

export async function POST(request: NextRequest) {
  try {
    const { email, emailCode, phoneCode } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // TODO: Validate codes against stored codes in DB
    // For now, accept "000000" as the valid code
    const PLACEHOLDER_CODE = '000000'

    const emailVerified = emailCode === PLACEHOLDER_CODE
    const phoneVerified = phoneCode === PLACEHOLDER_CODE

    return NextResponse.json({
      emailVerified,
      phoneVerified,
    })
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
