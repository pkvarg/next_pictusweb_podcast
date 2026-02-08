import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationParam = searchParams.get('organization')

    let organization: string | null = null

    if (organizationParam) {
      organization = organizationParam
    } else {
      const session = await getServerSession(authOptions)

      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (!session.user.isFleetManager) {
        return NextResponse.json({ error: 'Forbidden - Fleet Manager access required' }, { status: 403 })
      }

      if (!session.user.organization) {
        return NextResponse.json({ error: 'No organization assigned' }, { status: 400 })
      }

      organization = session.user.organization
    }

    const vehicles = await prisma.myVehicle.findMany({
      where: {
        organization,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        expenses: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
        },
        mileageRecords: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!session.user.isFleetManager) {
      return NextResponse.json({ error: 'Forbidden - Fleet Manager access required' }, { status: 403 })
    }

    if (!session.user.organization) {
      return NextResponse.json({ error: 'No organization assigned' }, { status: 400 })
    }

    const body = await request.json()
    const { type, registration, year, image, note } = body

    if (!type || !registration) {
      return NextResponse.json(
        { error: 'Type and registration are required' },
        { status: 400 }
      )
    }

    const vehicle = await prisma.myVehicle.create({
      data: {
        organization: session.user.organization,
        type,
        registration,
        year: year || null,
        image: image || null,
        note: note || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 })
  }
}
