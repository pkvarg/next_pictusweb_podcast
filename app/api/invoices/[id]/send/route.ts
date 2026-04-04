import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const honoApi = process.env.NEXT_PUBLIC_HONO_API_URL

    const res = await fetch(`${honoApi}/api/pictusweb/client/fleetsync-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceNumber: invoice.invoiceNumber,
        organizationName: invoice.organizationName,
        street: invoice.street || '',
        city: invoice.city || '',
        postalCode: invoice.postalCode || '',
        country: invoice.country || '',
        ico: invoice.ico || undefined,
        dic: invoice.dic || undefined,
        firstName: invoice.firstName,
        lastName: invoice.lastName,
        email: invoice.email,
        tier: invoice.tier,
        billing: invoice.billing,
        numberOfVehicles: invoice.numberOfVehicles,
        pricePerVehicle: invoice.pricePerVehicle,
        totalPrice: invoice.totalPrice,
        createdAt: invoice.createdAt.toISOString(),
        paymentType: invoice.paymentType,
        sendEmail: true,
        locale: 'sk',
      }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Failed to send invoice' }))
      return NextResponse.json(error, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invoice send error:', error)
    return NextResponse.json({ error: 'Failed to send invoice' }, { status: 500 })
  }
}
