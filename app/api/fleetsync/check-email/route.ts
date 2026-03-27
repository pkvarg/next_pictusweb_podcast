import { NextRequest, NextResponse } from 'next/server'
import db from '@/db/db'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ available: false, error: 'Invalid email' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return NextResponse.json({ available: !existingUser })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({ available: false, error: 'Server error' }, { status: 500 })
  }
}
