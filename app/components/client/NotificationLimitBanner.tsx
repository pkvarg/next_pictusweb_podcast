'use client'
import { AlertTriangle, XCircle, ArrowUpRight } from 'lucide-react'
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
    limitBlocked:
      'Dosiahli ste limit {limit} notifikácií pre {tier} tier. Vytváranie notifikácií je zablokované do ďalšieho fakturačného obdobia.',
    usage: 'Využili ste {current} z {limit} notifikácií ({percent}%).',
    remaining: 'Zostáva {remaining} notifikácií.',
    limitReached: 'Limit bol dosiahnutý.',
    freeWarning: 'Po dosiahnutí limitu bude váš účet deaktivovaný.',
    paidWarning: 'Kontaktujte administrátora pre navýšenie limitu.',
    upgrade: 'Upgradovať',
  },
  en: {
    canceled:
      'Your subscription has been canceled. Notifications are blocked. Renew your subscription to continue.',
    paymentIssue:
      'You have an unpaid invoice. Notifications are temporarily blocked. Update your payment method.',
    limitBlocked:
      'You have reached the limit of {limit} notifications for the {tier} tier. Notification creation is blocked until the next billing period.',
    usage: 'You have used {current} of {limit} notifications ({percent}%).',
    remaining: '{remaining} notifications remaining.',
    limitReached: 'Limit has been reached.',
    freeWarning: 'Your account will be deactivated when the limit is reached.',
    paidWarning: 'Contact the administrator to increase the limit.',
    upgrade: 'Upgrade',
  },
  hu: {
    canceled:
      'Az előfizetése megszűnt. Az értesítések le vannak tiltva. Újítsa meg az előfizetését a folytatáshoz.',
    paymentIssue:
      'Kifizetetlen számlája van. Az értesítések ideiglenesen le vannak tiltva. Frissítse a fizetési módját.',
    limitBlocked:
      'Elérte a(z) {tier} szint {limit} értesítési limitjét. Az értesítések létrehozása a következő számlázási időszakig le van tiltva.',
    usage: '{current}/{limit} értesítést használt fel ({percent}%).',
    remaining: '{remaining} értesítés maradt.',
    limitReached: 'A limit elérve.',
    freeWarning: 'A limit elérésekor a fiókja deaktiválásra kerül.',
    paidWarning: 'Lépjen kapcsolatba az adminisztrátorral a limit növeléséhez.',
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

  const usage = currentCount / limit
  const isFree = tierName.toUpperCase() === 'FREE'

  // Show banner at 80% usage or when blocked
  if (!blocked && usage < 0.8) return null

  const upgradeButton = isFree && (
    <Link
      href="/client/upgrade"
      className="ml-3 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-pictus-lime px-4 py-2 text-sm font-semibold text-pictus-black hover:bg-pictus-lime600 transition"
    >
      {t(locale, 'upgrade')}
      <ArrowUpRight size={14} />
    </Link>
  )

  if (blocked) {
    const isCanceled = subscriptionStatus === 'canceled'
    const isPaymentIssue = subscriptionStatus === 'past_due' || subscriptionStatus === 'unpaid'

    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300">
          <XCircle size={20} className="flex-shrink-0" />
          <p className="text-sm flex-1">
            {isCanceled
              ? t(locale, 'canceled')
              : isPaymentIssue
                ? t(locale, 'paymentIssue')
                : t(locale, 'limitBlocked', { limit, tier: tierName })}
          </p>
          {upgradeButton}
        </div>
      </div>
    )
  }

  // Warning: approaching limit
  const remaining = limit - currentCount
  const percent = Math.round(usage * 100)
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
      <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <AlertTriangle size={20} className="flex-shrink-0" />
        <p className="text-sm flex-1">
          {t(locale, 'usage', { current: currentCount, limit, percent })}{' '}
          {remaining > 0 ? t(locale, 'remaining', { remaining }) : t(locale, 'limitReached')}{' '}
          {isFree ? t(locale, 'freeWarning') : t(locale, 'paidWarning')}
        </p>
        {upgradeButton}
      </div>
    </div>
  )
}
