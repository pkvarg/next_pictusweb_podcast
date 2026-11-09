import { NextRequest, NextResponse } from 'next/server'
import { toE164 } from '@/lib/phone'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/db/db'
import { sameOriginOk } from '@/lib/sameOrigin'

async function getSessionUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, organizationId: true, role: true },
  })
}

// Billing details may be edited by the org's primary account — the sole member, an ADMIN, or
// the org's founding (oldest active) user — so an ordinary member of a multi-user org can't
// silently rewrite everyone's invoicing data, but the owner isn't locked out.
async function canEditOrgDetails(
  user: { id: string; organizationId: string | null; role: string } | null,
): Promise<boolean> {
  if (!user?.organizationId) return false
  if (user.role === 'ADMIN') return true
  const users = await prisma.user.findMany({
    where: { organizationId: user.organizationId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })
  if (users.length <= 1) return true
  return users[0]?.id === user.id
}

export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const account = await prisma.user.findUnique({
    where: { id: user.id },
    select: { firstName: true, lastName: true, email: true, phoneNumber: true },
  })

  const organization = user.organizationId
    ? await prisma.organization.findUnique({
        where: { id: user.organizationId },
        select: {
          name: true,
          mainContact: true,
          ico: true,
          dic: true,
          street: true,
          city: true,
          postalCode: true,
          country: true,
        },
      })
    : null

  const canEditOrg = await canEditOrgDetails(user)

  return NextResponse.json({ account, organization, canEditOrg })
}

export async function PATCH(request: NextRequest) {
  if (!sameOriginOk(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }

  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { account, organization } = body as {
    account?: Record<string, unknown>
    organization?: Record<string, unknown>
  }

  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined)

  if (account) {
    const accountData: Record<string, string | null> = {}
    if (account.firstName !== undefined) accountData.firstName = str(account.firstName) || null
    if (account.lastName !== undefined) accountData.lastName = str(account.lastName) || null
    if (account.phoneNumber !== undefined)
      accountData.phoneNumber = toE164(str(account.phoneNumber))
    if (Object.keys(accountData).length > 0) {
      await prisma.user.update({ where: { id: user.id }, data: accountData })
    }
  }

  if (organization && user.organizationId && (await canEditOrgDetails(user))) {
    const orgFields = [
      'name',
      'mainContact',
      'ico',
      'dic',
      'street',
      'city',
      'postalCode',
      'country',
    ]
    const orgData: Record<string, string | null> = {}
    for (const f of orgFields) {
      if (organization[f] === undefined) continue
      const v = str(organization[f])
      if (f === 'name') {
        if (v) orgData.name = v // name is required — only overwrite with a non-empty value
      } else {
        orgData[f] = v || null
      }
    }
    if (Object.keys(orgData).length > 0) {
      await prisma.organization.update({
        where: { id: user.organizationId },
        data: orgData,
      })
    }
  }

  return NextResponse.json({ success: true })
}
