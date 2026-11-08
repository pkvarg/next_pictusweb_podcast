import type { Prisma } from '@prisma/client'
import { sendPush } from './push'

export type DeliveryContext = Prisma.NotificationDeliveryGetPayload<{
  include: { recipient: true; occurrence: { include: { recurringEvent: true } } }
}>

export type SendFn = (d: DeliveryContext) => Promise<void>
export type Channels = Record<'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP', SendFn>

const HONO = process.env.NEXT_PUBLIC_HONO_API_URL

// Real senders. Email and SMS go through the hono_bun service (the prepared delivery
// infrastructure) at POST /api/pictusweb/client/send-reminder. IN_APP needs no transport
// (the delivery row itself is the in-app item). PUSH arrives in M15.
export const honoChannels: Channels = {
  IN_APP: async () => {
    /* no transport — surfaced via listInAppNotifications */
  },
  EMAIL: async (d) => {
    if (!HONO) throw new Error('NEXT_PUBLIC_HONO_API_URL not set')
    const to = d.recipient.email
    if (!to) throw new Error('recipient has no email')
    const res = await fetch(`${HONO}/api/pictusweb/client/send-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'email',
        to,
        stage: d.stage,
        event: d.occurrence.recurringEvent.name,
      }),
    })
    if (!res.ok) throw new Error(`email send failed: ${res.status}`)
  },
  SMS: async (d) => {
    if (!HONO) throw new Error('NEXT_PUBLIC_HONO_API_URL not set')
    const to = d.recipient.phoneNumber
    if (!to) throw new Error('recipient has no phone number')
    const res = await fetch(`${HONO}/api/pictusweb/client/send-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'sms',
        to,
        stage: d.stage,
        event: d.occurrence.recurringEvent.name,
      }),
    })
    if (!res.ok) throw new Error(`sms send failed: ${res.status}`)
  },
  PUSH: async (d) => {
    await sendPush(d.recipient.id, {
      title: d.occurrence.recurringEvent.name,
      body: 'Pripomienka FleetSync',
      url: '/client/my-fleet',
      tag: `occ-${d.occurrence.id}`,
    })
  },
}
