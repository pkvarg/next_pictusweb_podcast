import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { isAdminSession } from '@/lib/adminGuard'
import { encrypt } from '@/lib/crypto'
import { Product } from '@prisma/client'

// Admin-only. Carries the encrypted Doklado key — never return the key (plaintext or ciphertext),
// never log it. hasDokladoKey is the only thing the client learns about the key.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const orgs = await prisma.picDocsOrg.findMany({
      include: {
        organizationRelation: {
          select: {
            id: true,
            name: true,
            deletedAt: true,
            _count: { select: { users: { where: { active: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const summaries = orgs
      .filter((o) => !o.organizationRelation.deletedAt)
      .map((o) => ({
        organizationId: o.organizationId,
        name: o.organizationRelation.name,
        dokladoOrganizationId: o.dokladoOrganizationId,
        recipientEmail: o.recipientEmail,
        hasDokladoKey: o.dokladoApiKeyEnc != null,
        userCount: o.organizationRelation._count.users,
        lastRunAt: o.lastRunAt,
      }))

    return NextResponse.json({ orgs: summaries })
  } catch (error: any) {
    console.error('Failed to list PicDocs orgs:', error.message)
    return NextResponse.json({ error: 'Failed to list PicDocs orgs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const name = (body.name || '').trim()
    const dokladoOrganizationId = (body.dokladoOrganizationId || '').trim()
    const recipientEmail = (body.recipientEmail || '').trim()
    const dokladoApiKey: string | undefined = body.dokladoApiKey

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (!dokladoOrganizationId || dokladoOrganizationId.length > 50) {
      return NextResponse.json(
        { error: 'Doklado organization ID is required and must be at most 50 characters' },
        { status: 400 },
      )
    }
    if (!EMAIL_RE.test(recipientEmail)) {
      return NextResponse.json({ error: 'A valid recipient email is required' }, { status: 400 })
    }

    // Encrypt the key before it ever touches the DB; blank means "use the shared Pictusweb account".
    const dokladoApiKeyEnc =
      typeof dokladoApiKey === 'string' && dokladoApiKey.trim() !== ''
        ? encrypt(dokladoApiKey.trim())
        : null

    // One transaction so we never leave an Organization without its PicDocsOrg row.
    const created = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name,
          mainContact: recipientEmail,
          product: Product.PICDOCS,
        },
      })

      const picDocsOrg = await tx.picDocsOrg.create({
        data: {
          organizationId: org.id,
          dokladoOrganizationId,
          recipientEmail,
          dokladoApiKeyEnc,
        },
      })

      return { org, picDocsOrg }
    })

    return NextResponse.json(
      {
        organizationId: created.org.id,
        name: created.org.name,
        dokladoOrganizationId: created.picDocsOrg.dokladoOrganizationId,
        recipientEmail: created.picDocsOrg.recipientEmail,
        hasDokladoKey: created.picDocsOrg.dokladoApiKeyEnc != null,
        userCount: 0,
        lastRunAt: null,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('Failed to create PicDocs org:', error.message)
    return NextResponse.json({ error: 'Failed to create PicDocs org' }, { status: 500 })
  }
}
