import { Prisma, Powertrain } from '@prisma/client'

export interface VehicleInput {
  registration: string
  type?: string
  nickname?: string | null
  make?: string | null
  model?: string | null
  powertrain?: Powertrain | null
  country?: string | null
  vin?: string | null
  year?: number | null
  image?: string | null
  note?: string | null
}

// Create a vehicle, from catalogue selection or manual entry. `type` stays required
// (legacy column); default it from make/model when the caller only sends structured fields.
export async function createVehicle(
  tx: Prisma.TransactionClient,
  organizationId: string,
  userId: string,
  input: VehicleInput,
) {
  const type = input.type ?? ([input.make, input.model].filter(Boolean).join(' ') || 'Vehicle')
  return tx.myVehicle.create({
    data: {
      organizationId,
      userId,
      type,
      registration: input.registration,
      nickname: input.nickname ?? null,
      make: input.make ?? null,
      model: input.model ?? null,
      powertrain: input.powertrain ?? null,
      country: input.country ?? null,
      vin: input.vin ?? null,
      year: input.year ?? null,
      image: input.image ?? null,
      note: input.note ?? null,
    },
  })
}

// Searchable make/model catalogue (substring match on make or model).
export async function searchCatalogue(tx: Prisma.TransactionClient, query: string, limit = 20) {
  const q = query.trim()
  if (!q) return []
  return tx.vehicleCatalogueEntry.findMany({
    where: {
      OR: [
        { make: { contains: q, mode: 'insensitive' } },
        { model: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: limit,
    orderBy: [{ make: 'asc' }, { model: 'asc' }],
  })
}

// Powertrain- and country-applicable event templates for a vehicle. A template with an
// empty powertrains list applies to all; a null country applies to all countries.
export async function suggestTemplatesForVehicle(
  tx: Prisma.TransactionClient,
  vehicle: { powertrain?: Powertrain | null; country?: string | null },
) {
  const countryOr = vehicle.country
    ? [{ country: null }, { country: vehicle.country }]
    : [{ country: null }]
  const templates = await tx.eventTemplate.findMany({
    where: { active: true, OR: countryOr },
  })
  return templates.filter(
    (t) =>
      t.powertrains.length === 0 ||
      (vehicle.powertrain != null && t.powertrains.includes(vehicle.powertrain)),
  )
}
