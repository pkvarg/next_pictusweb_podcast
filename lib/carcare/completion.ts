import { Prisma } from '@prisma/client'
import { computeNextDue, type RecurrenceDefinition } from './recurrence'

export interface CompletionInput {
  date: Date
  mileage?: number | null
  providerId?: string | null
  cost?: number | string | null
  currency?: string | null
  notes?: string | null
}

function isUniqueViolation(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002'
}

// Completes an occurrence and generates exactly one successor (idempotent):
//  - a repeated call is a no-op once the occurrence is COMPLETED (sequential double-submit)
//  - concurrent calls are guarded by the UNIQUE constraint on generated_from_id (one successor max)
// Must run inside a transaction (pass prisma.$transaction's tx client).
export async function completeOccurrence(
  tx: Prisma.TransactionClient,
  occurrenceId: string,
  input: CompletionInput,
) {
  const occ = await tx.eventOccurrence.findUnique({
    where: { id: occurrenceId },
    include: { recurringEvent: true },
  })
  if (!occ) throw new Error(`occurrence not found: ${occurrenceId}`)
  if (occ.status === 'COMPLETED') return occ

  const updated = await tx.eventOccurrence.update({
    where: { id: occ.id },
    data: {
      status: 'COMPLETED',
      completedAt: input.date,
      completedMileage: input.mileage ?? null,
      completionProviderId: input.providerId ?? null,
      actualCost: input.cost ?? null,
      currency: input.currency ?? null,
      notes: input.notes ?? occ.notes,
    },
  })

  const def = occ.recurringEvent
  if (def.paused || def.deletedAt || def.recurrenceType === 'ONE_TIME') return updated

  const recurrence: RecurrenceDefinition = {
    recurrenceType: def.recurrenceType,
    intervalMonths: def.intervalMonths,
    intervalDays: def.intervalDays,
    intervalKm: def.intervalKm,
    seasonalMonth: def.seasonalMonth,
    seasonalDay: def.seasonalDay,
  }
  const next = computeNextDue(recurrence, {
    dueDate: occ.dueDate,
    completedAt: updated.completedAt,
    completedMileage: updated.completedMileage,
  })
  if (next.dueDate === null && next.dueMileage === null) return updated

  try {
    await tx.eventOccurrence.create({
      data: {
        recurringEventId: def.id,
        vehicleId: def.vehicleId,
        sequenceNo: occ.sequenceNo + 1,
        generatedFromId: occ.id,
        status: 'UPCOMING',
        dueDate: next.dueDate,
        dueMileage: next.dueMileage,
      },
    })
  } catch (e) {
    if (!isUniqueViolation(e)) throw e
  }

  return updated
}
