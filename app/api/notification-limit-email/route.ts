import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

/**
 * Internal proxy to send notification limit reached email via Hono API.
 * Called from notificationLimits.ts when a PREMIUM/BUSINESS org hits the limit.
 * No IP ban check needed — this is only called server-side.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const honoApiUrl = `${process.env.NEXT_PUBLIC_HONO_API_URL}/api/pictusweb/client/notification-limit`

    const response = await axios.post(honoApiUrl, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    console.error('Notification limit email proxy error:', error)

    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data?.error || 'Failed to send notification limit email' },
        { status: error.response.status },
      )
    }

    return NextResponse.json(
      { error: 'Failed to send notification limit email' },
      { status: 500 },
    )
  }
}
