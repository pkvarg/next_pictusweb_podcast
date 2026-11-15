import type { Prisma } from '@prisma/client'

// Deleting an organization must not orphan its benefit sub-orgs: a benefit sub-org has no
// meaning without its parent (it draws from the parent's shared pool), so it is removed with
// the parent and its users are deactivated. Both helpers run inside a transaction.

export async function softDeleteOrganization(
  tx: Prisma.TransactionClient,
  id: string,
): Promise<string[]> {
  const now = new Date()
  await tx.organization.update({ where: { id }, data: { deletedAt: now } })

  const subs = await tx.organization.findMany({
    where: { parentOrganizationId: id, isBenefitOrg: true, deletedAt: null },
    select: { id: true },
  })
  const subIds = subs.map((s) => s.id)
  if (subIds.length) {
    await tx.organization.updateMany({ where: { id: { in: subIds } }, data: { deletedAt: now } })
    await tx.user.updateMany({
      where: { organizationId: { in: subIds }, active: true },
      data: { active: false },
    })
  }
  return subIds
}

export async function hardDeleteOrganization(
  tx: Prisma.TransactionClient,
  id: string,
): Promise<void> {
  // Remove benefit sub-orgs first — they reference the parent, so otherwise the parent delete
  // is blocked (or would orphan them).
  await tx.organization.deleteMany({ where: { parentOrganizationId: id, isBenefitOrg: true } })
  await tx.organization.delete({ where: { id } })
}
