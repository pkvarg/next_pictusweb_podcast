import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''

    if (!reason) {
      return NextResponse.json({ error: 'Deletion reason is required' }, { status: 400 })
    }

    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice || invoice.deletedAt) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    await prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date(), deletionReason: reason.slice(0, 500) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete invoice:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
