'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

// Localized HTML recreation of the FleetSync "upcoming tasks" overview, used as a
// hero visual on the marketing page (replaces the old single-language screenshot).
const HeroTaskOverview = () => {
  const t = useTranslations('Automatizations')
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'numeric', year: 'numeric' }).format(new Date(iso))
  const d = t('heroDaySuffix')

  return (
    <div className="bg-gradient-to-br from-pictus-onyx900/70 to-pictus-black/90 rounded-2xl border border-pictus-lime/20 p-5 sm:p-6 shadow-2xl w-full">
      <h3 className="flex items-center gap-2.5 text-xl sm:text-2xl font-light text-pictus-white mb-5">
        <Calendar className="w-6 h-6 text-pictus-lime" />
        {t('heroTasksTitle')}
      </h3>

      <div className="space-y-3">
        {/* Row 1 — urgent */}
        <div className="flex items-center gap-3 border-l-2 border-red-500 bg-white/[0.03] rounded-r-lg pl-3 pr-3 py-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="relative w-12 h-10 rounded-md overflow-hidden bg-pictus-black shrink-0">
            <Image src="/genericcar.webp" alt="" fill sizes="48px" className="object-cover object-center" />
          </div>
          <div className="w-28 shrink-0">
            <p className="text-pictus-white text-base leading-tight tracking-wider select-none">BA-000-BB</p>
            <p className="text-pictus-lime text-xs">KIA Rio</p>
            <p className="text-gray-500 text-xs">Pictus</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs mb-0.5">{t('heroUpcomingTasks', { count: 1 })}</p>
            <p className="text-sm text-pictus-white">
              {t('heroTaskSummerTyres')} <span className="text-pictus-lime ml-2">{fmtDate('2026-04-01')}</span>
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-md bg-red-500/20 text-red-300 text-base font-medium shrink-0">5{d}</span>
        </div>

        {/* Row 2 — soon */}
        <div className="flex items-center gap-3 border-l-2 border-amber-500 bg-white/[0.03] rounded-r-lg pl-3 pr-3 py-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="relative w-12 h-10 rounded-md overflow-hidden bg-pictus-black shrink-0">
            <Image src="/genericcar.webp" alt="" fill sizes="48px" className="object-cover object-center" />
          </div>
          <div className="w-28 shrink-0">
            <p className="text-pictus-white text-base leading-tight tracking-wider select-none">TT-000-CC</p>
            <p className="text-pictus-lime text-xs">SUZUKI SX4</p>
            <p className="text-gray-500 text-xs">Pictus</p>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-400 text-xs mb-0.5">{t('heroUpcomingTasks', { count: 2 })}</p>
            <p className="text-sm text-pictus-white">
              {t('heroTaskInsurance')} <span className="text-pictus-lime ml-2">{fmtDate('2026-04-22')}</span>
            </p>
            <p className="text-sm text-pictus-white">
              {t('heroTaskOilChange')} <span className="text-pictus-lime ml-2">{fmtDate('2026-05-01')}</span>
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-300 text-base font-medium shrink-0">26{d}</span>
        </div>

        {/* Row 3 — clear */}
        <div className="flex items-center gap-3 border-l-2 border-pictus-lime/40 bg-white/[0.03] rounded-r-lg pl-3 pr-3 py-3">
          <Calendar className="w-5 h-5 text-gray-500 shrink-0" />
          <div className="relative w-12 h-10 rounded-md overflow-hidden bg-pictus-black shrink-0">
            <Image src="/genericcar.webp" alt="" fill sizes="48px" className="object-cover object-center" />
          </div>
          <div className="w-28 shrink-0">
            <p className="text-pictus-white text-base leading-tight tracking-wider select-none">ZA-000-DD</p>
            <p className="text-pictus-lime text-xs">Audi A6</p>
            <p className="text-gray-500 text-xs">Pictus</p>
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2 text-gray-400 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            {t('heroNoTasks')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroTaskOverview
