import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'

// TESTING ONLY: Get user's hybrid password status
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
      select: {
        id: true,
        email: true,
        loginProvider: true,
        hybridPassword: true, // This will be hashed
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('TESTING: User hybrid password info for:', user.email)
    console.log('TESTING: Login provider:', user.loginProvider)
    console.log('TESTING: Has hybrid password:', !!user.hybridPassword)
    
    return NextResponse.json({
      email: user.email,
      loginProvider: user.loginProvider,
      hasHybridPassword: !!user.hybridPassword,
      message: 'Check server logs for detailed password information'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user hybrid password info' }, { status: 500 })
  }
}