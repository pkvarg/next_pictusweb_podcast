import type { Channel } from '@prisma/client'

// Pure dispatch policy: given a delivery's channel, the org's tier, whether SMS is in the
// plan, the recipient's opt-ins and whether an email already covers the same reminder,
// decide which channel actually sends and whether it counts against the notification limit.
// No database, no side effects — so it is unit-testable and the single source of truth for
// the "never silently drop a reminder" rules that dispatchDue orchestrates.

export type ChannelPlan =
  | { action: 'suppress'; reason: string }
  | { action: 'send'; channel: Channel; metered: boolean }

export interface ChannelPlanInput {
  channel: Channel
  tierName: string | null | undefined
  smsAllowed: boolean
  channelOptIns: Channel[]
  // An EMAIL delivery already covers this reminder (same occurrence/stage/recipient), so an
  // SMS that cannot send must not duplicate it by also falling back to email.
  hasEmailSibling: boolean
}

export interface QuotaFallbackInput {
  channel: Channel
  tierName: string | null | undefined
  channelOptIns: Channel[]
  hasEmailSibling: boolean
}

function isFreeTier(tierName: string | null | undefined): boolean {
  return (tierName ?? '').toUpperCase() === 'FREE'
}

// Mirrors scheduler.isChannelAllowed. Kept inline to keep this module free of the orchestrator
// (and the dependency cycle that importing it would create).
function optedIn(optIns: Channel[], channel: Channel): boolean {
  if (channel === 'IN_APP') return true
  if (channel === 'EMAIL') return optIns.length === 0 || optIns.includes('EMAIL')
  return optIns.includes(channel)
}

// Metering: SMS always costs money, so it always counts. EMAIL counts only on the FREE tier,
// where it is the trial gate; on paid tiers email is free and unlimited, so it never counts.
// PUSH / IN_APP never count.
function isMetered(channel: Channel, tierName: string | null | undefined): boolean {
  return channel === 'SMS' || (channel === 'EMAIL' && isFreeTier(tierName))
}

export function planChannel(input: ChannelPlanInput): ChannelPlan {
  let channel = input.channel

  // An SMS the plan does not include falls back to email so the reminder still goes out —
  // unless an email already covers it, or the recipient has no email to fall back to.
  if (channel === 'SMS' && !input.smsAllowed) {
    if (input.hasEmailSibling) return { action: 'suppress', reason: 'covered by email' }
    if (!optedIn(input.channelOptIns, 'EMAIL')) {
      return { action: 'suppress', reason: 'sms not in plan' }
    }
    channel = 'EMAIL'
  }

  if (!optedIn(input.channelOptIns, channel)) {
    return { action: 'suppress', reason: 'channel not opted in' }
  }

  return { action: 'send', channel, metered: isMetered(channel, input.tierName) }
}

// Called when a metered send hit the notification limit. A paid SMS falls back to the free
// email channel so a paid customer's reminder is never silently dropped. FREE's email IS the
// trial, so there is nothing to fall back to: the reminder is suppressed and the trial ends
// (the caller then surfaces the upgrade prompt).
export function planQuotaFallback(input: QuotaFallbackInput): ChannelPlan {
  if (input.channel === 'SMS' && !isFreeTier(input.tierName)) {
    if (input.hasEmailSibling) return { action: 'suppress', reason: 'covered by email' }
    if (!optedIn(input.channelOptIns, 'EMAIL')) {
      return { action: 'suppress', reason: 'notification limit reached' }
    }
    return { action: 'send', channel: 'EMAIL', metered: false }
  }
  return {
    action: 'suppress',
    reason: isFreeTier(input.tierName) ? 'free trial expired' : 'notification limit reached',
  }
}
