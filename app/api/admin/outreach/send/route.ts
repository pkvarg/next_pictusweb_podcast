import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_RECIPIENTS = 200

export async function POST(request: NextRequest) {
  try {
    // Admin-only: this endpoint can email arbitrary recipients.
    // Note: the session callback lowercases role, so it's 'admin' (not 'ADMIN').
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role?.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { subject, htmlContent, emails } = await request.json()

    if (!subject || !htmlContent || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Normalize, validate and de-duplicate the typed-in addresses.
    const valid: string[] = []
    const invalid: string[] = []
    const seen = new Set<string>()
    for (const raw of emails) {
      const e = String(raw).trim().toLowerCase()
      if (!e) continue
      if (!EMAIL_RE.test(e)) {
        invalid.push(e)
        continue
      }
      if (seen.has(e)) continue
      seen.add(e)
      valid.push(e)
    }

    if (valid.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses', invalid }, { status: 400 })
    }
    if (valid.length > MAX_RECIPIENTS) {
      return NextResponse.json(
        { error: `Too many recipients (max ${MAX_RECIPIENTS})` },
        { status: 400 },
      )
    }

    // Cold outreach: the 'outreach' template renders a reply-based opt-out, so no
    // unsubscribe URL is needed (these recipients never subscribed).
    const recipients = valid.map((email) => ({ email }))

    const honoApi = process.env.NEXT_PUBLIC_HONO_API_URL
    const res = await fetch(`${honoApi}/api/pictusweb/client/send-release-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails: recipients, subject, htmlContent, templateType: 'outreach' }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Send failed' }))
      return NextResponse.json(error, { status: res.status })
    }

    const result = await res.json()
    return NextResponse.json({ ...result, invalid })
  } catch (error) {
    console.error('Outreach send error:', error)
    return NextResponse.json({ error: 'Failed to send outreach email' }, { status: 500 })
  }
}
