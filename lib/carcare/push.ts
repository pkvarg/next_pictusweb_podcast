import * as webpush from 'web-push'
import prisma from '@/db/db'

let configured = false

function ensureConfigured(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:info@pictusweb.sk'
  if (!publicKey || !privateKey) return false
  if (!configured) {
    webpush.setVapidDetails(subject, publicKey, privateKey)
    configured = true
  }
  return true
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

// Send a web-push notification to every subscription of a user. Expired/unsubscribed
// endpoints (404/410) are pruned. Returns how many were delivered.
export async function sendPush(userId: string, payload: PushPayload): Promise<number> {
  if (!ensureConfigured()) throw new Error('VAPID keys not configured')

  const subs = await prisma.pushSubscription.findMany({ where: { userId } })
  let sent = 0
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
      )
      sent++
    } catch (error) {
      const statusCode = (error as { statusCode?: number })?.statusCode
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.deleteMany({ where: { endpoint: s.endpoint } })
      } else {
        console.error('carcare push send failed:', statusCode, error)
      }
    }
  }
  return sent
}
