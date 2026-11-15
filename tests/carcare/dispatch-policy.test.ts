import { describe, it, expect } from 'vitest'
import type { Channel } from '@prisma/client'
import { planChannel, planQuotaFallback } from '@/lib/carcare/dispatch-policy'

const ch = (c: string) => c as Channel
const optIns = (...c: string[]) => c as Channel[]

describe('planChannel', () => {
  it('sends SMS metered when the plan allows SMS', () => {
    expect(
      planChannel({
        channel: ch('SMS'),
        tierName: 'BASIC',
        smsAllowed: true,
        channelOptIns: optIns('EMAIL', 'SMS'),
        hasEmailSibling: false,
      }),
    ).toEqual({ action: 'send', channel: 'SMS', metered: true })
  })

  it('falls back SMS -> email (not metered) on a paid plan without SMS', () => {
    expect(
      planChannel({
        channel: ch('SMS'),
        tierName: 'BASIC',
        smsAllowed: false,
        channelOptIns: optIns('EMAIL', 'SMS'),
        hasEmailSibling: false,
      }),
    ).toEqual({ action: 'send', channel: 'EMAIL', metered: false })
  })

  it('suppresses the SMS when an email already covers the reminder', () => {
    expect(
      planChannel({
        channel: ch('SMS'),
        tierName: 'BASIC',
        smsAllowed: false,
        channelOptIns: optIns('EMAIL', 'SMS'),
        hasEmailSibling: true,
      }),
    ).toEqual({ action: 'suppress', reason: 'covered by email' })
  })

  it('suppresses the SMS when there is no email to fall back to', () => {
    expect(
      planChannel({
        channel: ch('SMS'),
        tierName: 'BASIC',
        smsAllowed: false,
        channelOptIns: optIns('SMS'),
        hasEmailSibling: false,
      }),
    ).toEqual({ action: 'suppress', reason: 'sms not in plan' })
  })

  it('email is free (not metered) on a paid tier', () => {
    expect(
      planChannel({
        channel: ch('EMAIL'),
        tierName: 'BUSINESS',
        smsAllowed: true,
        channelOptIns: optIns(),
        hasEmailSibling: false,
      }),
    ).toEqual({ action: 'send', channel: 'EMAIL', metered: false })
  })

  it('email IS metered on the FREE trial', () => {
    expect(
      planChannel({
        channel: ch('EMAIL'),
        tierName: 'FREE',
        smsAllowed: false,
        channelOptIns: optIns(),
        hasEmailSibling: false,
      }),
    ).toEqual({ action: 'send', channel: 'EMAIL', metered: true })
  })

  it('push never counts', () => {
    expect(
      planChannel({
        channel: ch('PUSH'),
        tierName: 'FREE',
        smsAllowed: false,
        channelOptIns: optIns('PUSH'),
        hasEmailSibling: false,
      }),
    ).toEqual({ action: 'send', channel: 'PUSH', metered: false })
  })

  it('suppresses a channel the recipient has not opted into', () => {
    expect(
      planChannel({
        channel: ch('EMAIL'),
        tierName: 'BASIC',
        smsAllowed: true,
        channelOptIns: optIns('SMS'),
        hasEmailSibling: false,
      }),
    ).toEqual({ action: 'suppress', reason: 'channel not opted in' })
  })

  it('untiered (legacy) email is not metered', () => {
    expect(
      planChannel({
        channel: ch('EMAIL'),
        tierName: null,
        smsAllowed: true,
        channelOptIns: optIns(),
        hasEmailSibling: false,
      }),
    ).toEqual({ action: 'send', channel: 'EMAIL', metered: false })
  })
})

describe('planQuotaFallback', () => {
  it('paid SMS over quota falls back to free email', () => {
    expect(
      planQuotaFallback({
        channel: ch('SMS'),
        tierName: 'BUSINESS',
        channelOptIns: optIns('EMAIL', 'SMS'),
        hasEmailSibling: false,
      }),
    ).toEqual({ action: 'send', channel: 'EMAIL', metered: false })
  })

  it('paid SMS over quota is suppressed when email already covers it', () => {
    expect(
      planQuotaFallback({
        channel: ch('SMS'),
        tierName: 'BUSINESS',
        channelOptIns: optIns('EMAIL', 'SMS'),
        hasEmailSibling: true,
      }),
    ).toEqual({ action: 'suppress', reason: 'covered by email' })
  })

  it('paid SMS over quota with no email is suppressed as limit reached', () => {
    expect(
      planQuotaFallback({
        channel: ch('SMS'),
        tierName: 'BASIC',
        channelOptIns: optIns('SMS'),
        hasEmailSibling: false,
      }),
    ).toEqual({ action: 'suppress', reason: 'notification limit reached' })
  })

  it('FREE email over the trial limit ends the trial (no fallback)', () => {
    expect(
      planQuotaFallback({
        channel: ch('EMAIL'),
        tierName: 'FREE',
        channelOptIns: optIns(),
        hasEmailSibling: false,
      }),
    ).toEqual({ action: 'suppress', reason: 'free trial expired' })
  })
})
