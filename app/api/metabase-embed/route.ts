import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const METABASE_SITE_URL = process.env.METABASE_SITE_URL
const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY
const METABASE_DASHBOARD_ID = process.env.METABASE_DASHBOARD_ID || '10'

export async function GET() {
  try {
    if (!METABASE_SITE_URL || !METABASE_SECRET_KEY) {
      console.error('Metabase environment variables not configured')
      return NextResponse.json({ error: 'Metabase not configured' }, { status: 500 })
    }

    const payload = {
      resource: { dashboard: parseInt(METABASE_DASHBOARD_ID) },
      params: {},
      exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
    }

    const token = jwt.sign(payload, METABASE_SECRET_KEY)

    const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`

    return NextResponse.json({ iframeUrl })
  } catch (error) {
    console.error('Error generating Metabase embed URL:', error)
    return NextResponse.json({ error: 'Failed to generate embed URL' }, { status: 500 })
  }
}
