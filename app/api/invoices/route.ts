import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}
