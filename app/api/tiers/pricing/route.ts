import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const HARDCODED_PRICING = [
  { name: 'BASIC', pricePerVehicle: 2, pricePerVehicleYearly: 20, yearlyDiscount: 0.83, vehiclesLimit: 999 },
  { name: 'BUSINESS', pricePerVehicle: 3, pricePerVehicleYearly: 30, yearlyDiscount: 0.83, vehiclesLimit: 999 },
  { name: 'FREE', pricePerVehicle: 0, pricePerVehicleYearly: 0, yearlyDiscount: 1, vehiclesLimit: 1 },
]

export async function GET() {
  return NextResponse.json({ pricing: HARDCODED_PRICING })
}
