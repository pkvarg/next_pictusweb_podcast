'use client'
import { AlertTriangle, XCircle, ArrowUpRight, Info } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/routing'

interface NotificationLimitBannerProps {
  currentCount: number
  limit: number
  tierName: string
  blocked?: boolean
  subscriptionStatus?: string | null
}

const i18n: Record<string, Record<string, string>> = {
  sk: {
    canceled:
      'Vaše predplatné bolo zrušené. Notifikácie sú zablokované. Obnovte predplatné pre pokračovanie.',
    paymentIssue:
      'Máte neuhradenú platbu. Notifikácie sú dočasne zablokované. Aktualizujte platobnú metódu.',
    smsBlocked:
      'Dosiahli ste limit {limit} SMS pripomienok pre toto obdobie. Pripomienky naďalej posielame e-mailom.',
    freeLimitBlocked:
      'Vyčerpali ste FREE skúšobnú verziu ({limit} notifikácií). Pre pokračovanie prejdite na vyšší plán.',
    smsUsage: 'Využili ste {current} z {limit} SMS pripomienok ({percent} %).',
    emailUnlimited: 'E-maily sú neobmedzené.',
    freeTrialCounter: 'Skúšobná verzia: využili ste {current} z {limit} notifikácií ({percent} %).',
    freeWarning: 'Po vyčerpaní je potrebný upgrade na vyšší plán.',
    upgrade: 'Upgradovať',
  },
  en: {
    canceled:
      'Your subscription has been canceled. Notifications are blocked. Renew your subscription to continue.',
    paymentIssue:
      'You have an unpaid invoice. Notifications are temporarily blocked. Update your payment method.',
    smsBlocked:
      'You have reached the limit of {limit} SMS reminders for this period. Reminders keep going out by email.',
    freeLimitBlocked:
      'Your FREE trial is used up ({limit} notifications). Upgrade to keep sending reminders.',
    smsUsage: 'You have used {current} of {limit} SMS reminders ({percent}%).',
    emailUnlimited: 'Emails are unlimited.',
    freeTrialCounter: 'Trial: you have used {current} of {limit} notifications ({percent}%).',
    freeWarning: 'You will need to upgrade once the limit is reached.',
    upgrade: 'Upgrade',
  },
  hu: {
    canceled:
      'Az előfizetése megszűnt. Az értesítések le vannak tiltva. Újítsa meg az előfizetését a folytatáshoz.',
    paymentIssue:
      'Kifizetetlen számlája van. Az értesítések ideiglenesen le vannak tiltva. Frissítse a fizetési módját.',
    smsBlocked:
      'Elérte a(z) {limit} SMS emlékeztető limitjét erre az időszakra. Az emlékeztetők e-mailben továbbra is mennek.',
    freeLimitBlocked:
      'Elhasználta a FREE próbaverziót ({limit} értesítés). A folytatáshoz váltson magasabb csomagra.',
    smsUsage: '{current}/{limit} SMS emlékeztetőt használt fel ({percent}%).',
    emailUnlimited: 'Az e-mailek korlátlanok.',
    freeTrialCounter: 'Próbaverzió: {current}/{limit} értesítést használt fel ({percent}%).',
    freeWarning: 'A limit elérésekor magasabb csomagra kell váltania.',
    upgrade: 'Frissítés',
  },
}

function t(locale: string, key: string, params?: Record<string, string | number>): string {
  let text = i18n[locale]?.[key] || i18n['sk'][key] || key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replaceAll(`{${k}}`, String(v))
    }
  }
  return text
}

export default function NotificationLimitBanner({
  currentCount,
  limit,
  tierName,
  blocked,
  subscriptionStatus,
}: NotificationLimitBannerProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'

  if (limit <= 0) return null

  const isFree = tierName.toUpperCase() === 'FREE'
  const usage = currentCount / limit
  const percent = Math.round(usage * 100)

  const upgradeButton = isFree && (
    <Link
      href="/client/upgrade"
      className="ml-3 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-pictus-lime px-4 py-2 text-sm font-semibold text-pictus-black hover:bg-pictus-lime600 transition"
    >
      {t(locale, 'upgrade')}
      <ArrowUpRight size={14} />
    </Link>
  )

  // Blocked — subscription/billing issue, FREE trial over, or paid SMS quota reached.
  if (blocked) {
    const isCanceled = subscriptionStatus === 'canceled'
    const isPaymentIssue = subscriptionStatus === 'past_due' || subscriptionStatus === 'unpaid'
    const message = isCanceled
      ? t(locale, 'canceled')
      : isPaymentIssue
        ? t(locale, 'paymentIssue')
        : isFree
          ? t(locale, 'freeLimitBlocked', { limit })
          : t(locale, 'smsBlocked', { limit })

    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300">
          <XCircle size={20} className="flex-shrink-0" />
          <p className="text-sm flex-1">{message}</p>
          {upgradeButton}
        </div>
      </div>
    )
  }

  // FREE: an always-visible trial counter so the user sees how much of the trial is left.
  if (isFree) {
    const warn = usage >= 0.8
    const tone = warn
      ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
      : 'bg-white/5 border-white/10 text-gray-300'
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border ${tone}`}>
          {warn ? (
            <AlertTriangle size={20} className="flex-shrink-0" />
          ) : (
            <Info size={20} className="flex-shrink-0" />
          )}
          <p className="text-sm flex-1">
            {t(locale, 'freeTrialCounter', { current: currentCount, limit, percent })}{' '}
            {warn && t(locale, 'freeWarning')}
          </p>
          {upgradeButton}
        </div>
      </div>
    )
  }

  // Paid (BASIC / BUSINESS): only the SMS allowance is capped (email is unlimited), so show an
  // SMS usage warning as it runs low. Stays quiet until 80%.
  if (usage < 0.8) return null
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <AlertTriangle size={20} className="flex-shrink-0" />
        <p className="text-sm flex-1">
          {t(locale, 'smsUsage', { current: currentCount, limit, percent })}{' '}
          {t(locale, 'emailUnlimited')}
        </p>
      </div>
    </div>
  )
}
