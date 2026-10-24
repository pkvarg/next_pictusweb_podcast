import prisma from '@/db/db'

// Per-org rate limit shared by the PicDocs run and reset endpoints (both make quota-bearing Doklado
// calls). A rolling 1-hour window counted on PicDocsOrg.runsThisHour / rateWindowStart.
export const PICDOCS_RATE_LIMIT_PER_HOUR = 20
const HOUR_MS = 60 * 60 * 1000

export class PicDocsRateLimitError extends Error {}

export async function enforcePicDocsRateLimit(organizationId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const current = await tx.picDocsOrg.findUnique({
      where: { organizationId },
      select: { runsThisHour: true, rateWindowStart: true },
    })
    const now = new Date()
    const windowStale =
      !current?.rateWindowStart || now.getTime() - current.rateWindowStart.getTime() > HOUR_MS

    if (windowStale) {
      await tx.picDocsOrg.update({
        where: { organizationId },
        data: { runsThisHour: 1, rateWindowStart: now },
      })
      return
    }
    if ((current?.runsThisHour ?? 0) >= PICDOCS_RATE_LIMIT_PER_HOUR) {
      throw new PicDocsRateLimitError()
    }
    await tx.picDocsOrg.update({
      where: { organizationId },
      data: { runsThisHour: { increment: 1 } },
    })
  })
}
