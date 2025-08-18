import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../../../lib/isValidPassword'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
        deletedAt: null,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, organization, active, password, loginProvider } = body

    // Prepare update data
    const updateData: any = {}
    if (email) updateData.email = email
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (organization !== undefined) updateData.organization = organization
    if (active !== undefined) updateData.active = active
    if (loginProvider !== undefined) updateData.loginProvider = loginProvider
    
    // Hash password if provided
    if (password !== undefined && password.trim() !== '') {
      updateData.password = await hashPassword(password)
    }

    // Update name if firstName or lastName changed
    if (firstName || lastName) {
      const currentUser = await prisma.user.findUnique({
        where: { id: params.id }
      })
      if (currentUser) {
        updateData.name = `${firstName || currentUser.firstName} ${lastName || currentUser.lastName}`
      }
    }

    const user = await prisma.user.update({
      where: {
        id: params.id,
        deletedAt: null,
      },
      data: updateData,
    })

    return NextResponse.json(user)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.update({
      where: {
        id: params.id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}