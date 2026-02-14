import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
