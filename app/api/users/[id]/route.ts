import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { hashPassword } from '../../../../lib/isValidPassword'

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
      include: {
        organizationRelation: {
          select: {
            id: true,
            name: true,
          }
        }
      }
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
    const { email, firstName, lastName, phoneNumber, organizationId, active, isFleetManager, password, loginProvider } = body

    // Prepare update data
    const updateData: any = {}
    if (email) updateData.email = email
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber

    // Update organizationId if provided
    if (organizationId !== undefined) {
      updateData.organizationId = organizationId
    }

    if (active !== undefined) updateData.active = active
    if (isFleetManager !== undefined) updateData.isFleetManager = isFleetManager
    if (loginProvider !== undefined) updateData.loginProvider = loginProvider

    // If setting login provider to hybrid, ALWAYS set default password
    if (loginProvider === 'hybrid') {
      const defaultPassword = process.env.DEFAULT_USER_PASSWORD
      updateData.password = await hashPassword(defaultPassword)
      console.log(`TESTING: Set HYBRID user password to default: ${defaultPassword}`)
    } else if (password !== undefined && password.trim() !== '') {
      // Hash password if provided (for non-hybrid users)
      updateData.password = await hashPassword(password)
      console.log(`TESTING: Set custom password for user`)
    }

    const user = await prisma.user.update({
      where: {
        id: resolvedParams.id,
        deletedAt: null,
      },
      data: updateData,
      include: {
        organizationRelation: {
          select: {
            id: true,
            name: true,
          }
        }
      }
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