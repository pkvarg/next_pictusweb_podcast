import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../../lib/isValidPassword'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const defaultPassword = 'Pic*Client*2025'
    const hashedPassword = await hashPassword(defaultPassword)
    
    console.log(`TESTING: Force setting hybrid password for ${email} to: ${defaultPassword}`)
    
    const user = await prisma.user.update({
      where: {
        email: email,
        deletedAt: null
      },
      data: {
        hybridPassword: hashedPassword,
        loginProvider: 'hybrid'
      }
    })
    
    console.log(`TESTING: Successfully set hybrid password for ${user.email}`)
    console.log(`TESTING: User can now login with: ${defaultPassword}`)
    
    return NextResponse.json({
      message: `Set hybrid password for ${user.email}`,
      password: defaultPassword
    })
  } catch (error) {
    console.error('Error setting hybrid password:', error)
    return NextResponse.json({ error: 'Failed to set hybrid password' }, { status: 500 })
  }
}