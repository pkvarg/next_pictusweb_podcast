import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { isAdminSession } from '@/lib/adminGuard'
import { encrypt } from '@/lib/crypto'

// Admin-only. Carries the encrypted Doklado key — never return the key, never log it.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const data: {
      recipientEmail?: string
      dokladoOrganizationId?: string
      dokladoApiKeyEnc?: string | null
    } = {}

    if (body.recipientEmail !== undefined) {
      const email = (body.recipientEmail || '').trim()
      if (!EMAIL_RE.test(email)) {
        return NextResponse.json({ error: 'A valid recipient email is required' }, { status: 400 })
      }
      data.recipientEmail = email
    }

    if (body.dokladoOrganizationId !== undefined) {
      const dokladoOrganizationId = (body.dokladoOrganizationId || '').trim()
      if (!dokladoOrganizationId || dokladoOrganizationId.length > 50) {
        return NextResponse.json(
          { error: 'Doklado organization ID is required and must be at most 50 characters' },
          { status: 400 },
        )
      }
      data.dokladoOrganizationId = dokladoOrganizationId
    }

    // Key rotation: non-empty string → re-encrypt; "" → clear to null (fall back to shared key);
    // omitted/undefined → leave the stored ciphertext untouched.
    if (typeof body.dokladoApiKey === 'string') {
      const trimmed = body.dokladoApiKey.trim()
      data.dokladoApiKeyEnc = trimmed === '' ? null : encrypt(trimmed)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updated = await prisma.picDocsOrg.update({
      where: { organizationId: id },
      data,
      include: {
        organizationRelation: {
          select: {
            name: true,
            _count: { select: { users: { where: { active: true } } } },
          },
        },
      },
    })

    return NextResponse.json({
      organizationId: updated.organizationId,
      name: updated.organizationRelation.name,
      dokladoOrganizationId: updated.dokladoOrganizationId,
      recipientEmail: updated.recipientEmail,
      hasDokladoKey: updated.dokladoApiKeyEnc != null,
      userCount: updated.organizationRelation._count.users,
      lastRunAt: updated.lastRunAt,
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'PicDocs org not found' }, { status: 404 })
    }
    console.error('Failed to update PicDocs org:', error.message)
    return NextResponse.json({ error: 'Failed to update PicDocs org' }, { status: 500 })
  }
}
