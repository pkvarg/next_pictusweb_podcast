import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

export async function GET(
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

    const invoiceData = {
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
    }

    const honoApi = process.env.NEXT_PUBLIC_HONO_API_URL

    const res = await fetch(`${honoApi}/api/pictusweb/client/fleetsync-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Invoice generation failed' }))
      return NextResponse.json(error, { status: res.status })
    }

    const pdfBuffer = await res.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fleetsync-faktura-${invoice.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Invoice regeneration error:', error)
    return NextResponse.json({ error: 'Failed to regenerate invoice' }, { status: 500 })
  }
}
