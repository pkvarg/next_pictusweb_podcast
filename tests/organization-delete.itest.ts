import { describe, it, expect, afterEach } from 'vitest'
import prisma from '@/db/db'
import { softDeleteOrganization } from '@/lib/organization-delete'

const cleanup: { userIds: string[]; orgIds: string[] } = { userIds: [], orgIds: [] }

afterEach(async () => {
  if (cleanup.userIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: cleanup.userIds } } })
  }
  if (cleanup.orgIds.length) {
    await prisma.organization.deleteMany({ where: { id: { in: cleanup.orgIds } } })
  }
  cleanup.userIds = []
  cleanup.orgIds = []
})

describe('softDeleteOrganization', () => {
  it('cascades: soft-deletes benefit sub-orgs and deactivates their users', async () => {
    const stamp = Date.now()
    const parent = await prisma.organization.create({ data: { name: `itest-parent-${stamp}` } })
    const sub = await prisma.organization.create({
      data: {
        name: `itest-sub-${stamp}`,
        parentOrganizationId: parent.id,
        isBenefitOrg: true,
      },
    })
    const user = await prisma.user.create({
      data: {
        email: `itest-sub-${stamp}@example.com`,
        role: 'CLIENT',
        organizationId: sub.id,
        active: true,
      },
    })
    cleanup.userIds.push(user.id)
    cleanup.orgIds.push(sub.id, parent.id)

    await prisma.$transaction((tx) => softDeleteOrganization(tx, parent.id))

    const parentAfter = await prisma.organization.findUnique({ where: { id: parent.id } })
    const subAfter = await prisma.organization.findUnique({ where: { id: sub.id } })
    const userAfter = await prisma.user.findUnique({ where: { id: user.id } })

    expect(parentAfter?.deletedAt).not.toBeNull()
    expect(subAfter?.deletedAt).not.toBeNull()
    expect(userAfter?.active).toBe(false)
  })

  it('leaves a parent without benefit sub-orgs untouched otherwise', async () => {
    const stamp = Date.now()
    const parent = await prisma.organization.create({ data: { name: `itest-solo-${stamp}` } })
    cleanup.orgIds.push(parent.id)

    const subIds = await prisma.$transaction((tx) => softDeleteOrganization(tx, parent.id))

    expect(subIds).toEqual([])
    const after = await prisma.organization.findUnique({ where: { id: parent.id } })
    expect(after?.deletedAt).not.toBeNull()
  })
})
