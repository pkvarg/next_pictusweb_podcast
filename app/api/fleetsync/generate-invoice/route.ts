import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function generateInvoiceNumber(): Promise<string> {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1)

  const count = await prisma.invoice.count({
    where: {
      createdAt: { gte: yearStart, lt: yearEnd },
    },
  })

  const orderNumber = String(count + 1).padStart(3, '0')
  return `FS-${yy}${mm}${orderNumber}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      organizationName,
      street,
      city,
      postalCode,
      country,
      ico,
      dic,
      firstName,
      lastName,
      email,
      tier,
      billing,
      numberOfVehicles,
      pricePerVehicle,
      totalPrice,
      locale,
    } = body

    if (!organizationName || !email || !tier || !billing || !numberOfVehicles) {
      return NextResponse.json({ error: 'Missing required invoice fields' }, { status: 400 })
    }

    const invoiceNumber = await generateInvoiceNumber()

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        organizationName,
        street: street || null,
        city: city || null,
        postalCode: postalCode || null,
        country: country || null,
        ico: ico || null,
        dic: dic || null,
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        tier,
        billing,
        numberOfVehicles,
        pricePerVehicle,
        totalPrice,
      },
    })

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
      sendEmail: true,
      locale: locale || 'en',
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
        'Content-Disposition': `attachment; filename="fleetsync-faktura-${invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}
