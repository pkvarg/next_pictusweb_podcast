import { NextRequest, NextResponse } from 'next/server'

// PLACEHOLDER: Real email/SMS sending will be implemented later.
// For now, this endpoint always returns success.
// The verification codes are "000000" for both email and phone.

export async function POST(request: NextRequest) {
  try {
    const { email, phoneNumber } = await request.json()

    if (!email || !phoneNumber) {
      return NextResponse.json({ error: 'Email and phone number are required' }, { status: 400 })
    }

    // TODO: Send real verification codes via email and SMS
    // For now, just simulate success
    console.log(`[PLACEHOLDER] Would send verification code to email: ${email}`)
    console.log(`[PLACEHOLDER] Would send verification code to phone: ${phoneNumber}`)

    return NextResponse.json({ success: true, message: 'Verification codes sent' })
  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification codes' }, { status: 500 })
  }
}
