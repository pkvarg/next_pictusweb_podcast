import { NextRequest, NextResponse } from 'next/server'
import db from '@/db/db'

export async function GET(request: NextRequest) {
  try {
    const contactLogs = await db.contactLog.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(contactLogs)
  } catch (error) {
    console.error('Error fetching contact logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact logs' },
      { status: 500 },
    )
  }
}
