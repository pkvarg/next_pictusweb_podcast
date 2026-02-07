import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../../../lib/isValidPassword'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const user = await prisma.user.findUnique({
      where: {
        id: resolvedParams.id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { email, firstName, lastName, organization, active, isFleetManager, password, loginProvider } = body

    // Prepare update data
    const updateData: any = {}
    if (email) updateData.email = email
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (organization !== undefined) updateData.organization = organization
    if (active !== undefined) updateData.active = active
    if (isFleetManager !== undefined) updateData.isFleetManager = isFleetManager
    if (loginProvider !== undefined) updateData.loginProvider = loginProvider
    
    // If setting login provider to hybrid, ALWAYS set default password
    if (loginProvider === 'hybrid') {
      const defaultPassword = 'Pic*Client*2025'
      updateData.password = await hashPassword(defaultPassword)
      console.log(`TESTING: Set HYBRID user password to default: ${defaultPassword}`)
    } else if (password !== undefined && password.trim() !== '') {
      // Hash password if provided (for non-hybrid users)
      updateData.password = await hashPassword(password)
      console.log(`TESTING: Set custom password for user`)
    }

    // Update name if firstName or lastName changed
    if (firstName || lastName) {
      const currentUser = await prisma.user.findUnique({
        where: { id: resolvedParams.id }
      })
      if (currentUser) {
        updateData.name = `${firstName || currentUser.firstName} ${lastName || currentUser.lastName}`
      }
    }

    const user = await prisma.user.update({
      where: {
        id: resolvedParams.id,
        deletedAt: null,
      },
      data: updateData,
    })

    console.log(`TESTING: User ${user.email} updated successfully`)
    console.log(`TESTING: Final loginProvider: ${user.loginProvider}`)
    console.log(`TESTING: Has hybridPassword: ${!!user.hybridPassword}`)
    if (user.hybridPassword) {
      console.log(`TESTING: HybridPassword hash (first 20 chars): ${user.hybridPassword.substring(0, 20)}...`)
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const user = await prisma.user.update({
      where: {
        id: resolvedParams.id,
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