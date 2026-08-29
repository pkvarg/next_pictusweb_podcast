import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import prisma from '@/db/db'

/**
 * Update the caller's own organization notification preferences. Identity and
 * org come from the session (never the request body), and only fleet managers
 * may change them.
 */
export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    })
    if (!token?.email && !token?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!token.isFleetManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const organizationId = token.organizationId as string | undefined
    if (!organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 })
    }

    const body = await request.json()
    const data: { useCustomTemplates?: boolean; confirmNotificationCreation?: boolean } = {}
    if (typeof body.useCustomTemplates === 'boolean') {
      data.useCustomTemplates = body.useCustomTemplates
    }
    if (typeof body.confirmNotificationCreation === 'boolean') {
      data.confirmNotificationCreation = body.confirmNotificationCreation
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 })
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data,
      select: { id: true, useCustomTemplates: true, confirmNotificationCreation: true },
    })

    return NextResponse.json({ success: true, organization: updated })
  } catch (error) {
    console.error('Failed to update notification settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
