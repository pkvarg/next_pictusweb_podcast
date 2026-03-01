import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Convert Decimal to number for JSON serialization
    const pricing = tiers.map((t) => ({
      name: t.name,
      pricePerVehicle: t.pricePerVehicle ? Number(t.pricePerVehicle) : 0,
      pricePerVehicleYearly: t.pricePerVehicleYearly ? Number(t.pricePerVehicleYearly) : null,
      yearlyDiscount: t.yearlyDiscount ? Number(t.yearlyDiscount) : 0.83,
      vehiclesLimit: t.vehiclesLimit,
    }))

    return NextResponse.json({ pricing })
  } catch (error) {
    console.error('Failed to fetch tier pricing:', error)
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 })
  }
}
