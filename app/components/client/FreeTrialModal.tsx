'use client'
import { Link } from '@/i18n/routing'
import { useParams } from 'next/navigation'
import { ShieldCheck, ArrowUpRight } from 'lucide-react'

interface FreeTrialModalProps {
  tierName: string
  blocked: boolean
}

const i18n: Record<string, { title: string; body: string; upgrade: string }> = {
  sk: {
    title: 'FREE skúšobná verzia je vyčerpaná',
    body: 'Vyčerpali ste limit notifikácií vo FREE verzii, preto sme pozastavili odosielanie pripomienok. Prejdite na vyšší plán a pokračujte bez prerušenia.',
    upgrade: 'Prejsť na vyšší plán',
  },
  en: {
    title: 'Your FREE trial is used up',
    body: 'You have reached the FREE plan notification limit, so reminders are paused. Upgrade to keep sending them without interruption.',
    upgrade: 'Upgrade now',
  },
  hu: {
    title: 'A FREE próbaverzió elhasználva',
    body: 'Elérte a FREE csomag értesítési limitjét, ezért az emlékeztetők szünetelnek. Váltson magasabb csomagra a folytatáshoz.',
    upgrade: 'Frissítés most',
  },
}

export default function FreeTrialModal({ tierName, blocked }: FreeTrialModalProps) {
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'
  const copy = i18n[locale] ?? i18n.sk

  if (!blocked || tierName.toUpperCase() !== 'FREE') return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="free-trial-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-pictus-black p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pictus-lime/15">
          <ShieldCheck className="h-7 w-7 text-pictus-lime" aria-hidden="true" />
        </div>
        <h2 id="free-trial-title" className="mb-2 text-xl font-bold text-white">
          {copy.title}
        </h2>
        <p className="mb-6 text-sm text-gray-400">{copy.body}</p>
        <Link
          href="/client/upgrade"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pictus-lime px-6 py-3 text-sm font-semibold text-pictus-black transition hover:bg-pictus-lime600"
        >
          {copy.upgrade}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  )
}
