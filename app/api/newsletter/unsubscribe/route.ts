import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/db/db'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('orgId')
    const token = searchParams.get('token')

    if (!orgId || !token) {
      return new NextResponse(htmlPage('Neplatný odkaz', 'Odkaz na odhlásenie je neplatný.'), {
        headers: { 'Content-Type': 'text/html' },
        status: 400,
      })
    }

    const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET
    if (!secret) {
      return new NextResponse(htmlPage('Chyba', 'Chyba konfigurácie servera.'), {
        headers: { 'Content-Type': 'text/html' },
        status: 500,
      })
    }

    const expectedToken = crypto
      .createHmac('sha256', secret)
      .update(orgId)
      .digest('hex')

    if (token !== expectedToken) {
      return new NextResponse(htmlPage('Neplatný odkaz', 'Odkaz na odhlásenie je neplatný alebo vypršal.'), {
        headers: { 'Content-Type': 'text/html' },
        status: 403,
      })
    }

    await prisma.organization.update({
      where: { id: orgId },
      data: { newsletterOptOut: true },
    })

    return new NextResponse(
      htmlPage('Odhlásené', 'Boli ste úspešne odhlásení z odberu noviniek FleetSync.'),
      { headers: { 'Content-Type': 'text/html' } }
    )
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return new NextResponse(htmlPage('Chyba', 'Niečo sa pokazilo. Skúste to znova neskôr.'), {
      headers: { 'Content-Type': 'text/html' },
      status: 500,
    })
  }
}

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — FleetSync</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #111; color: #fff; }
    .card { text-align: center; padding: 3rem; max-width: 400px; background: #1a1a1a; border-radius: 12px; border: 1px solid #333; }
    h1 { margin: 0 0 1rem; font-size: 1.5rem; }
    p { color: #999; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`
}
