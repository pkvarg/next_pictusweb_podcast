import { NextRequest, NextResponse } from 'next/server'
import { checkIPBan } from '@/lib/checkIPBan'
import axios from 'axios'

/**
 * Contact form proxy with IP ban protection
 * Checks if IP is banned before forwarding to Hono API
 */
export async function POST(request: NextRequest) {
  try {
    // Check if IP is banned first
    const ipCheck = await checkIPBan(request)
    if (ipCheck.isBanned && ipCheck.banInfo) {
      return NextResponse.json(
        {
          error: 'Access Denied',
          message: ipCheck.banInfo.message,
          code: 'IP_BANNED',
        },
        { status: 403 },
      )
    }

    // Get request body
    const body = await request.json()

    // Forward to Hono API
    const honoApiUrl = `${process.env.NEXT_PUBLIC_HONO_API_URL}/api/contact`

    const response = await axios.post(honoApiUrl, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Return Hono API response
    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    console.error('Contact form proxy error:', error)

    // Handle axios errors
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        {
          error: error.response.data?.error || 'Failed to send message',
          message: error.response.data?.message || 'An error occurred',
        },
        { status: error.response.status },
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process contact form submission',
      },
      { status: 500 },
    )
  }
}
