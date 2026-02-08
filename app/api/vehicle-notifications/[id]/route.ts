import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idString } = await params
    const id = parseInt(idString)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 }
      )
    }

    // Soft delete - set deletedAt timestamp
    await prisma.vehicleNotification.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete vehicle notification:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle notification' },
      { status: 500 }
    )
  }
}
