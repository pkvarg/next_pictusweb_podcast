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

export default function NotificationLimitBanner({
  currentCount,
  limit,
  tierName,
  blocked,
  subscriptionStatus,
}: NotificationLimitBannerProps) {
  if (limit <= 0) return null

  const usage = currentCount / limit
  const isFree = tierName.toUpperCase() === 'FREE'

  // Show banner at 80% usage or when blocked
  if (!blocked && usage < 0.8) return null

  const upgradeButton = isFree && (
    <Link
      href="/client/upgrade"
      className="ml-3 inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-pictus-lime px-3 py-1 text-sm font-semibold text-black hover:bg-pictus-lime/80 transition"
    >
      Upgradovať
      <ArrowUpRight size={14} />
    </Link>
  )

  if (blocked) {
    const isCanceled = subscriptionStatus === 'canceled'
    const isPaymentIssue = subscriptionStatus === 'past_due' || subscriptionStatus === 'unpaid'

    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300">
          <XCircle size={20} className="flex-shrink-0" />
          <p className="text-sm flex-1">
            {isCanceled ? (
              <>Vaše predplatné bolo zrušené. Notifikácie sú zablokované. Obnovte predplatné pre pokračovanie.</>
            ) : isPaymentIssue ? (
              <>Máte neuhradenú platbu. Notifikácie sú dočasne zablokované. Aktualizujte platobnú metódu.</>
            ) : (
              <>Dosiahli ste limit <strong>{limit}</strong> notifikácií pre{' '}
              <strong>{tierName}</strong> tier. Vytváranie notifikácií je zablokované do ďalšieho fakturačného obdobia.</>
            )}
          </p>
          {upgradeButton}
        </div>
      </div>
    )
  }

  // Warning: approaching limit
  const remaining = limit - currentCount
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
        <AlertTriangle size={20} className="flex-shrink-0" />
        <p className="text-sm flex-1">
          Využili ste <strong>{currentCount}</strong> z <strong>{limit}</strong> notifikácií
          ({Math.round(usage * 100)}%).
          {remaining > 0 ? (
            <> Zostáva <strong>{remaining}</strong> notifikácií.</>
          ) : (
            <> Limit bol dosiahnutý.</>
          )}
          {isFree && (
            <> Po dosiahnutí limitu bude váš účet deaktivovaný.</>
          )}
          {!isFree && (
            <> Kontaktujte administrátora pre navýšenie limitu.</>
          )}
        </p>
        {upgradeButton}
      </div>
    </div>
  )
}
