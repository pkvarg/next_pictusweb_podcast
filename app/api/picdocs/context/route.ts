import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { Product } from '@prisma/client'

// Returns the current PicDocs user's organization name + identity for the workspace header.
export async function GET() {
  const session = await getServerSession(authOptions)
  const organizationId = (session?.user as any)?.organizationId as string | undefined
  if (!session?.user || !organizationId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const product = (session.user as any).product as string | undefined
  if (product !== Product.PICDOCS) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { name: true },
  })

  // The org's own result-recipient address (not a secret — shown to that org's own user).
  const picDocsOrg = await prisma.picDocsOrg.findUnique({
    where: { organizationId },
    select: { recipientEmail: true },
  })

  return NextResponse.json({
    organizationName: organization?.name ?? null,
    userName: (session.user as any).name ?? null,
    userEmail: (session.user as any).email ?? null,
    recipientEmail: picDocsOrg?.recipientEmail ?? null,
  })
}
