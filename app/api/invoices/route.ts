import { NextResponse } from 'next/server'
import prisma from '@/db/db'

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { deletedAt: null },
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
