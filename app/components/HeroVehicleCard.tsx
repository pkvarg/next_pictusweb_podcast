'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Calendar, Gauge, Euro } from 'lucide-react'

// Localized HTML recreation of the FleetSync vehicle card used as a hero visual on
// the marketing page (replaces the old single-language screenshot).
const HeroVehicleCard = () => {
  const t = useTranslations('Automatizations')
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date(iso))
  const fmtKm = (n: number) => new Intl.NumberFormat(locale).format(n)
  const fmtEur = (n: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(n)

  return (
    <div className="bg-gradient-to-br from-pictus-onyx900/70 to-pictus-black/90 rounded-2xl border border-pictus-lime/20 overflow-hidden shadow-2xl w-full max-w-[570px]">
      {/* Photo area with anonymized plate */}
      <div className="relative h-48 bg-pictus-black">
        <Image src="/genericcar.webp" alt="" fill sizes="570px" className="object-cover object-center" />
        <span className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-pictus-black/80 border border-white/10 text-pictus-white text-lg tracking-wider select-none">
          BA-000-AA
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-2xl font-light text-pictus-lime">Pictus auto</h3>
        <p className="flex items-center gap-2 text-sm text-gray-300 mt-1">
          <Calendar className="w-4 h-4 text-pictus-lime" /> {t('heroYear', { year: 2019 })}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">PICTUSACI</p>

        {/* Stat boxes */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/5 rounded-xl p-4 border border-pictus-lime/10">
            <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <Gauge className="w-3.5 h-3.5 text-pictus-lime" /> {t('heroOdometer')}
            </p>
            <p className="text-2xl font-light text-pictus-white">{fmtKm(220000)}</p>
            <p className="text-xs text-gray-500">km</p>
            <p className="text-xs text-pictus-lime mt-1">{fmtDate('2026-02-14')}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-pictus-lime/10">
            <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <Euro className="w-3.5 h-3.5 text-pictus-lime" /> {t('heroExpenses')}
            </p>
            <p className="text-2xl font-light text-pictus-white">{fmtEur(250)}</p>
            <p className="text-xs text-gray-500 mt-1">{t('heroRecords', { count: 2 })}</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <span className="text-center text-sm py-2 rounded-lg bg-pictus-lime/80 text-pictus-black">{t('heroTotal')}</span>
          <span className="text-center text-sm py-2 rounded-lg bg-white/5 text-gray-300 border border-white/10">{t('heroThisYear')}</span>
          <span className="text-center text-sm py-2 rounded-lg bg-white/5 text-gray-300 border border-white/10">{t('heroThisMonth')}</span>
        </div>

        {/* Recent expenses */}
        <p className="flex items-center gap-1.5 text-sm text-pictus-lime mt-5 mb-3">
          <Euro className="w-4 h-4" /> {t('heroRecentExpenses')}
        </p>
        <div className="space-y-2">
          <div className="flex items-start justify-between bg-white/[0.03] rounded-lg px-3 py-2">
            <div>
              <p className="text-pictus-white text-sm">{t('heroExpTyre')}</p>
              <p className="text-xs text-gray-500">{fmtDate('2026-02-21')}</p>
              <p className="text-xs text-gray-500 italic mt-0.5">
                {t('heroExpTyreNote')} <span className="text-pictus-lime not-italic">link</span>
              </p>
            </div>
            <span className="text-pictus-lime text-sm whitespace-nowrap">{fmtEur(50)}</span>
          </div>
          <div className="flex items-start justify-between bg-white/[0.03] rounded-lg px-3 py-2">
            <div>
              <p className="text-pictus-white text-sm">{t('heroExpWindscreen')}</p>
              <p className="text-xs text-gray-500">{fmtDate('2026-02-14')}</p>
            </div>
            <span className="text-pictus-lime text-sm whitespace-nowrap">{fmtEur(200)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroVehicleCard
