import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { subject, htmlContent, organizationIds } = await request.json()

    if (!subject || !htmlContent || !organizationIds?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Unsubscribe secret not configured' }, { status: 500 })
    }

    const organizations = await prisma.organization.findMany({
      where: {
        id: { in: organizationIds },
        newsletterOptOut: false,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        mainContact: true,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || ''

    const emails = organizations
      .filter((org) => org.mainContact)
      .map((org) => {
        const token = crypto
          .createHmac('sha256', secret)
          .update(org.id)
          .digest('hex')
        const unsubscribeUrl = `${appUrl}/api/newsletter/unsubscribe?orgId=${org.id}&token=${token}`
        return {
          email: org.mainContact!,
          organizationName: org.name,
          orgId: org.id,
          unsubscribeUrl,
        }
      })

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No valid recipients found' }, { status: 400 })
    }

    const honoApi = process.env.NEXT_PUBLIC_HONO_API_URL

    const res = await fetch(`${honoApi}/api/pictusweb/client/send-release-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails, subject, htmlContent }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Send failed' }))
      return NextResponse.json(error, { status: res.status })
    }

    const result = await res.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Release notes send error:', error)
    return NextResponse.json({ error: 'Failed to send release notes' }, { status: 500 })
  }
}
