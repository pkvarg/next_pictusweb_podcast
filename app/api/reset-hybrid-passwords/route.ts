import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../../lib/isValidPassword'

const prisma = new PrismaClient()

// TESTING ONLY: Reset all hybrid users to default password
export async function POST(request: NextRequest) {
  try {
    const defaultPassword = 'Pic*Client*2025'
    const hashedPassword = await hashPassword(defaultPassword)
    
    // Find all hybrid users
    const hybridUsers = await prisma.user.findMany({
      where: {
        loginProvider: 'hybrid',
        deletedAt: null,
        active: true
      }
    })
    
    console.log(`TESTING: Found ${hybridUsers.length} hybrid users to reset`)
    
    // Update all hybrid users to use the default password
    const updateResult = await prisma.user.updateMany({
      where: {
        loginProvider: 'hybrid',
        deletedAt: null,
        active: true
      },
      data: {
        hybridPassword: hashedPassword
      }
    })
    
    console.log(`TESTING: Reset ${updateResult.count} hybrid users to default password: ${defaultPassword}`)
    
    // Log each user that was reset
    for (const user of hybridUsers) {
      console.log(`TESTING: Reset hybrid password for user ${user.email}: ${defaultPassword}`)
    }
    
    return NextResponse.json({
      message: `Reset ${updateResult.count} hybrid users to default password`,
      usersReset: hybridUsers.map(u => u.email),
      defaultPassword: defaultPassword
    })
  } catch (error) {
    console.error('Error resetting hybrid passwords:', error)
    return NextResponse.json({ error: 'Failed to reset hybrid passwords' }, { status: 500 })
  }
}