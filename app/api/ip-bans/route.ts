import { NextRequest, NextResponse } from 'next/server'
import { getAllBannedIPs, getStats, clearAllBans } from '@/lib/ipReputation'

/**
 * GET /api/ip-bans
 * Get all banned IPs or statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stats') {
      const stats = await getStats()
      return NextResponse.json(
        {
          success: true,
          stats,
        },
        { status: 200 },
      )
    }

    // Default: return all banned IPs
    const bannedIPs = await getAllBannedIPs()
    return NextResponse.json(
      {
        success: true,
        count: bannedIPs.length,
        bannedIPs,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching banned IPs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/ip-bans
 * Clear all IP bans (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    await clearAllBans()
    return NextResponse.json(
      {
        success: true,
        message: 'All IP bans cleared',
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error clearing bans:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
