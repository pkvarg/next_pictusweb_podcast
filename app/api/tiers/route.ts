import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

export async function GET(request: NextRequest) {
  try {
    const tiers = await prisma.tier.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ tiers })
  } catch (error) {
    console.error('Failed to fetch tiers:', error)
    return NextResponse.json({ error: 'Failed to fetch tiers' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, pricePerVehicle, pricePerVehicleYearly, yearlyDiscount, stripePriceMonthly, stripePriceYearly } = body

    if (!id) {
      return NextResponse.json({ error: 'Tier ID is required' }, { status: 400 })
    }

    const existing = await prisma.tier.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    const updated = await prisma.tier.update({
      where: { id },
      data: {
        ...(pricePerVehicle !== undefined && { pricePerVehicle: pricePerVehicle === null ? null : parseFloat(pricePerVehicle) }),
        ...(pricePerVehicleYearly !== undefined && { pricePerVehicleYearly: pricePerVehicleYearly === null ? null : parseFloat(pricePerVehicleYearly) }),
        ...(yearlyDiscount !== undefined && { yearlyDiscount: yearlyDiscount === null ? null : parseFloat(yearlyDiscount) }),
        ...(stripePriceMonthly !== undefined && { stripePriceMonthly: stripePriceMonthly || null }),
        ...(stripePriceYearly !== undefined && { stripePriceYearly: stripePriceYearly || null }),
      },
    })

    return NextResponse.json({ tier: updated })
  } catch (error) {
    console.error('Failed to update tier:', error)
    return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 })
  }
}
