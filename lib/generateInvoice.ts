import prisma from '@/db/db'

export async function generateInvoiceNumber(): Promise<string> {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1)

  const existing = await prisma.invoice.findMany({
    where: {
      createdAt: { gte: yearStart, lt: yearEnd },
      deletedAt: null,
    },
    select: { invoiceNumber: true },
  })

  const used = new Set(
    existing.map((i) => parseInt(i.invoiceNumber.slice(7), 10)).filter((n) => !Number.isNaN(n)),
  )

  let seq = 1
  while (used.has(seq)) seq++

  const orderNumber = String(seq).padStart(3, '0')
  return `FS-${yy}${mm}${orderNumber}`
}

interface InvoiceData {
  organizationName: string
  street?: string
  city?: string
  postalCode?: string
  country?: string
  ico?: string
  dic?: string
  firstName: string
  lastName: string
  email: string
  tier: string
  billing: string
  numberOfVehicles: number
  pricePerVehicle: number
  totalPrice: number
  paymentType?: string
  locale?: string
}

export async function generateAndSendInvoice(data: InvoiceData): Promise<void> {
  const invoiceNumber = await generateInvoiceNumber()

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      organizationName: data.organizationName,
      street: data.street || null,
      city: data.city || null,
      postalCode: data.postalCode || null,
      country: data.country || null,
      ico: data.ico || null,
      dic: data.dic || null,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email,
      tier: data.tier,
      billing: data.billing,
      numberOfVehicles: data.numberOfVehicles,
      pricePerVehicle: data.pricePerVehicle,
      totalPrice: data.totalPrice,
      paymentType: data.paymentType || 'stripe',
    },
  })

  const honoApi = process.env.NEXT_PUBLIC_HONO_API_URL

  await fetch(`${honoApi}/api/pictusweb/client/fleetsync-invoice`, {
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
      locale: data.locale || 'sk',
    }),
  })
}
