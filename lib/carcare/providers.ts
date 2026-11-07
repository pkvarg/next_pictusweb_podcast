import { Prisma } from '@prisma/client'

export interface ProviderInput {
  name: string
  category?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  bookingUrl?: string | null
  address?: string | null
  notes?: string | null
}

export async function createProvider(
  tx: Prisma.TransactionClient,
  organizationId: string,
  input: ProviderInput,
) {
  return tx.provider.create({ data: { organizationId, ...input } })
}

export async function updateProvider(
  tx: Prisma.TransactionClient,
  providerId: string,
  input: Partial<ProviderInput>,
) {
  return tx.provider.update({ where: { id: providerId }, data: input })
}

// Soft delete — providers are referenced by appointments/history, so we never hard-delete.
export async function archiveProvider(tx: Prisma.TransactionClient, providerId: string) {
  return tx.provider.update({ where: { id: providerId }, data: { deletedAt: new Date() } })
}

export async function listProviders(tx: Prisma.TransactionClient, organizationId: string) {
  return tx.provider.findMany({
    where: { organizationId, deletedAt: null },
    orderBy: { name: 'asc' },
  })
}
