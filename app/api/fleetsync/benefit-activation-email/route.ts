import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

/**
 * Proxy to send benefit activation email to the benefit user via Hono API.
 * Called server-side after creating a benefit user + sub-org.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const honoApiUrl = `${process.env.NEXT_PUBLIC_HONO_API_URL}/api/pictusweb/client/benefit-activation`

    const response = await axios.post(honoApiUrl, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return NextResponse.json(response.data, { status: response.status })
  } catch (error) {
    console.error('Benefit activation email proxy error:', error)

    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data?.error || 'Failed to send benefit activation email' },
        { status: error.response.status },
      )
    }

    return NextResponse.json(
      { error: 'Failed to send benefit activation email' },
      { status: 500 },
    )
  }
}
