'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { BarChart3, TrendingUp } from 'lucide-react'

// Static, deterministic demo data used purely to showcase the BUSINESS analytics
// widgets on the marketing page. Expense "items" are real-world categories.
interface DemoExpense {
  registration: string
  item: string
  date: string
  cost: number
}

// Keyed by stable category id; the displayed label is translated per locale.
const CATEGORY_COLORS: Record<string, string> = {
  fuel: '#FAC775', // amber
  service: '#378ADD', // blue
  insurance: '#AE7BFF', // purple
  tyres: '#1D9E75', // teal
}
const FALLBACK_COLORS = ['#B6E036', '#ED93B1', '#F0997B', '#9FA88F']

// Profiles tuned so a year of *logged* expenses lands at a few hundred euros per
// vehicle — what a fleet manager actually enters (insurance, service, tyres, the
// occasional fuel), not a full per-litre operating-cost ledger.
// Plates use the "000" numeric group, which the Slovak registry never issues, so
// they read as authentic sample plates but cannot collide with a real vehicle.
const DEMO_VEHICLES = [
  { reg: 'BA-000-AA', fuel: 38, insYear: 165 },
  { reg: 'BA-000-BB', fuel: 30, insYear: 135 },
  { reg: 'TT-000-CC', fuel: 26, insYear: 120 },
  { reg: 'ZA-000-DD', fuel: 22, insYear: 105 },
]
const DEMO_YEARS = [2025, 2026]

const round5 = (n: number) => Math.round(n / 5) * 5

const buildDemoData = (): DemoExpense[] => {
  const out: DemoExpense[] = []
  for (const v of DEMO_VEHICLES) {
    for (const year of DEMO_YEARS) {
      const yf = year === 2026 ? 1 : 0.9 // prior year slightly lower
      for (let m = 0; m < 12; m++) {
        const date = `${year}-${String(m + 1).padStart(2, '0')}-12`
        out.push({
          registration: v.reg,
          item: 'fuel',
          date,
          cost: round5(v.fuel * yf * (1 + 0.18 * Math.sin((m + 1) * 1.1))),
        })
        out.push({ registration: v.reg, item: 'insurance', date, cost: Math.round((v.insYear / 12) * yf) })
      }
      out.push({ registration: v.reg, item: 'service', date: `${year}-05-08`, cost: round5(v.fuel * 3.5 * yf) })
      out.push({ registration: v.reg, item: 'service', date: `${year}-10-20`, cost: round5(v.fuel * 2.4 * yf) })
      out.push({ registration: v.reg, item: 'tyres', date: `${year}-03-15`, cost: round5(v.fuel * 1.5 * yf) })
      out.push({ registration: v.reg, item: 'tyres', date: `${year}-11-05`, cost: round5(v.fuel * 1.5 * yf) })
    }
  }
  return out
}

const DEMO_DATA = buildDemoData()

const FleetAnalyticsShowcase = () => {
  const t = useTranslations('Client')
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'

  const years = useMemo(() => Array.from(new Set(DEMO_DATA.map((e) => Number(e.date.slice(0, 4))))).sort((a, b) => b - a), [])
  const [selectedYear, setSelectedYear] = useState(years[0])
  const [selectedReg, setSelectedReg] = useState<string | null>(null)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)

  const monthLabels = useMemo(
    () => Array.from({ length: 12 }, (_, m) => new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2020, m, 1))),
    [locale],
  )

  const stats = useMemo(() => {
    const inYear = (e: DemoExpense) => Number(e.date.slice(0, 4)) === selectedYear
    const yearExpenses = DEMO_DATA.filter(inYear)

    const totalsByReg = new Map<string, number>()
    yearExpenses.forEach((e) => totalsByReg.set(e.registration, (totalsByReg.get(e.registration) || 0) + e.cost))
    const vehicleTotals = Array.from(totalsByReg, ([registration, total]) => ({ registration, total })).sort((a, b) => b.total - a.total)

    const fleetTotal = vehicleTotals.reduce((s, v) => s + v.total, 0)
    const avgPerVehicle = fleetTotal / vehicleTotals.length

    const monthly = Array.from({ length: 12 }, () => 0)
    yearExpenses.forEach((e) => {
      monthly[Number(e.date.slice(5, 7)) - 1] += e.cost
    })

    return { vehicleTotals, fleetTotal, avgPerVehicle, monthly, top: vehicleTotals[0] }
  }, [selectedYear])

  const activeReg = selectedReg && stats.vehicleTotals.some((v) => v.registration === selectedReg) ? selectedReg : stats.top.registration

  const itemSeries = useMemo(() => {
    const groups = new Map<string, number[]>()
    DEMO_DATA.filter((e) => e.registration === activeReg && Number(e.date.slice(0, 4)) === selectedYear).forEach((e) => {
      if (!groups.has(e.item)) groups.set(e.item, Array.from({ length: 12 }, () => 0))
      groups.get(e.item)![Number(e.date.slice(5, 7)) - 1] += e.cost
    })
    const series = Array.from(groups, ([key, monthly], i) => ({
      key,
      monthly,
      color: CATEGORY_COLORS[key] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      total: monthly.reduce((s, n) => s + n, 0),
    })).sort((a, b) => b.total - a.total)
    const max = Math.max(...series.flatMap((s) => s.monthly), 1)
    return { series, max }
  }, [activeReg, selectedYear])

  const monthlyMax = Math.max(...stats.monthly, 1)

  const categoryLabels: Record<string, string> = {
    fuel: t('catFuel'),
    service: t('catService'),
    insurance: t('catInsurance'),
    tyres: t('catTyres'),
  }

  // SVG line chart geometry.
  const LW = 720
  const LH = 220
  const padL = 8
  const padR = 8
  const padT = 12
  const padB = 24
  const plotW = LW - padL - padR
  const plotH = LH - padT - padB
  const xAt = (m: number) => padL + (plotW * m) / 11
  const yAt = (val: number, max: number) => padT + plotH - (plotH * val) / max

  return (
    <div className="bg-gradient-to-br from-pictus-onyx900/60 to-pictus-black/80 rounded-3xl p-6 sm:p-8 border border-pictus-lime/30 shadow-2xl">
      <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pictus-lime/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-pictus-lime" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-light text-pictus-white">{t('analyticsTitle')}</h3>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-pictus-lime/10">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                y === selectedYear ? 'bg-pictus-lime text-pictus-black font-medium' : 'text-gray-400 hover:text-pictus-white hover:bg-white/10'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white/5 rounded-xl p-5 border border-pictus-lime/10">
          <p className="text-sm text-gray-400 mb-1">{t('analyticsTotal', { year: selectedYear })}</p>
          <p className="text-3xl font-light text-pictus-white">{formatCurrency(stats.fleetTotal)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-pictus-lime/10">
          <p className="text-sm text-gray-400 mb-1">{t('analyticsAvgPerVehicle')}</p>
          <p className="text-3xl font-light text-pictus-white">{formatCurrency(stats.avgPerVehicle)}</p>
          <p className="text-xs text-gray-500 mt-1">{t('analyticsVehicleCount', { count: stats.vehicleTotals.length })}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-pictus-lime/10">
          <p className="text-sm text-gray-400 mb-1">{t('analyticsTopVehicle')}</p>
          <p className="text-2xl font-light text-pictus-white">{stats.top.registration}</p>
          <p className="text-sm text-red-400 mt-1">{formatCurrency(stats.top.total)}</p>
        </div>
      </div>

      {/* Monthly fleet spend */}
      <div className="mb-10">
        <h4 className="text-lg font-normal text-pictus-white mb-4">{t('analyticsMonthly', { year: selectedYear })}</h4>
        <div className="flex items-end justify-between gap-1.5 h-44">
          {stats.monthly.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
              <div className="w-full flex items-end justify-center h-full">
                <div
                  className="w-full max-w-[28px] bg-pictus-lime/80 group-hover:bg-pictus-lime rounded-t transition-all relative"
                  style={{ height: `${Math.max((val / monthlyMax) * 100, val > 0 ? 2 : 0)}%` }}
                >
                  {val > 0 && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-pictus-lime opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                      {formatCurrency(val)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-500 mt-1.5">{monthLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cost per vehicle ranking */}
      <div className="mb-10">
        <h4 className="text-lg font-normal text-pictus-white mb-4">{t('analyticsByVehicle', { year: selectedYear })}</h4>
        <div className="space-y-3">
          {stats.vehicleTotals.map((v) => {
            const aboveAvg = v.total >= stats.avgPerVehicle
            return (
              <div key={v.registration} className="flex items-center gap-3">
                <span className="w-24 sm:w-28 shrink-0 text-sm text-pictus-white truncate">{v.registration}</span>
                <div className="flex-1 bg-white/5 rounded-md h-7 overflow-hidden">
                  <div
                    className={`h-full rounded-md ${aboveAvg ? 'bg-red-500/70' : 'bg-pictus-lime/70'}`}
                    style={{ width: `${(v.total / stats.top.total) * 100}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-sm text-pictus-white">{formatCurrency(v.total)}</span>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500/70" /> {t('analyticsAboveAvg')}
          <span className="inline-block w-3 h-3 rounded-sm bg-pictus-lime/70 ml-3" /> {t('analyticsBelowAvg')}
        </p>
      </div>

      {/* Per-vehicle cost trend by category */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h4 className="text-lg font-normal text-pictus-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pictus-lime" />
            {t('analyticsByItem', { year: selectedYear })}
          </h4>
          <select
            value={activeReg}
            onChange={(e) => setSelectedReg(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-pictus-lime/20 rounded-lg text-pictus-white text-sm focus:outline-none focus:ring-2 focus:ring-pictus-lime min-w-[150px]"
          >
            {stats.vehicleTotals.map((v) => (
              <option key={v.registration} value={v.registration} className="bg-pictus-black">
                {v.registration}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
          {itemSeries.series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-xs text-gray-300">
              <span className="inline-block w-3.5 h-0.5" style={{ backgroundColor: s.color }} />
              {categoryLabels[s.key] || s.key}
            </span>
          ))}
        </div>
        <svg viewBox={`0 0 ${LW} ${LH}`} className="w-full" style={{ height: 220 }} role="img">
          {[0, 0.5, 1].map((g) => (
            <line key={g} x1={padL} x2={LW - padR} y1={padT + plotH * g} y2={padT + plotH * g} stroke="#ffffff" strokeOpacity={0.06} strokeWidth={1} />
          ))}
          {itemSeries.series.map((s) => (
            <polyline
              key={s.key}
              points={s.monthly.map((val, m) => `${xAt(m)},${yAt(val, itemSeries.max)}`).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {monthLabels.map((lbl, m) => (
            <text key={m} x={xAt(m)} y={LH - 6} fontSize={10} fill="#9ca3af" textAnchor="middle">
              {lbl}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

export default FleetAnalyticsShowcase
