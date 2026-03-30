import { NextResponse } from 'next/server'
import prisma from '@/db/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const tiers = await prisma.tier.findMany({
      where: { deletedAt: null },
      select: {
        name: true,
        pricePerVehicle: true,
        pricePerVehicleYearly: true,
        yearlyDiscount: true,
        vehiclesLimit: true,
      },
      orderBy: { name: 'asc' },
    })

    const pricing = tiers.map((t) => ({
      name: t.name,
      pricePerVehicle: t.pricePerVehicle ? Number(t.pricePerVehicle) : 0,
      pricePerVehicleYearly: t.pricePerVehicleYearly ? Number(t.pricePerVehicleYearly) : 0,
      yearlyDiscount: t.yearlyDiscount ? Number(t.yearlyDiscount) : 1,
      vehiclesLimit: t.vehiclesLimit,
    }))

    return NextResponse.json({ pricing })
  } catch (error) {
    console.error('Failed to fetch pricing:', error)
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 })
  }
}
