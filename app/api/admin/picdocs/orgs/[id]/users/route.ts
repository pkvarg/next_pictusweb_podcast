import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import { isAdminSession } from '@/lib/adminGuard'
import { sameOriginOk } from '@/lib/sameOrigin'
import { hashPassword } from '@/lib/isValidPassword'
import { Product, Role } from '@prisma/client'

// Admin-only user management for a PicDocs org. A dedicated route (not /api/users) because that
// endpoint has no admin guard and runs FleetSync tier/subscription checks that don't apply here.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params
    const users = await prisma.user.findMany({
      where: { organizationId: id, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        active: true,
        createdAt: true,
        lastLoggedIn: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('Failed to list PicDocs org users:', error.message)
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOriginOk(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const email = (body.email || '').trim()
    const firstName = (body.firstName || '').trim()
    const lastName = (body.lastName || '').trim()
    const password: string = body.password || ''

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }
    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First and last name are required' }, { status: 400 })
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password is required and must be at least 8 characters' },
        { status: 400 },
      )
    }

    // The org must exist and actually be a PicDocs org.
    const org = await prisma.organization.findFirst({
      where: { id, deletedAt: null, product: Product.PICDOCS },
      select: { id: true },
    })
    if (!org) {
      return NextResponse.json({ error: 'PicDocs org not found' }, { status: 404 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        organizationId: id,
        active: true,
        role: Role.CLIENT,
        password: hashedPassword,
        loginProvider: 'credentials',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        active: true,
        createdAt: true,
        lastLoggedIn: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    console.error('Failed to create PicDocs org user:', error.message)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
