'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { BarChart3, TrendingUp } from 'lucide-react'

interface Expense {
  id: string
  item: string
  cost: number
  date: string
}

interface Vehicle {
  id: string
  registration: string
  type: string
  expenses: Expense[]
}

interface FleetExpenseAnalyticsProps {
  organization?: string
}

// Distinct, dark-theme-friendly line/series colors. pictus-lime first.
const ITEM_COLORS = [
  '#B6E036', // pictus-lime
  '#378ADD', // blue
  '#AE7BFF', // purple
  '#F0997B', // coral
  '#1D9E75', // teal
  '#FAC775', // amber
  '#ED93B1', // pink
  '#9FA88F', // onyx
]

const normalizeItem = (item: string) => item.trim().toLowerCase()

const FleetExpenseAnalytics = ({ organization }: FleetExpenseAnalyticsProps) => {
  const t = useTranslations('Client')
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const url = organization
          ? `/api/my-vehicles?organization=${encodeURIComponent(organization)}`
          : '/api/my-vehicles'
        const res = await fetch(url)
        if (!res.ok) {
          setVehicles([])
          return
        }
        const data = await res.json()
        setVehicles(data.vehicles || [])
      } catch {
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [organization])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount)

  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) =>
        new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2020, m, 1)),
      ),
    [locale],
  )

  // Clean the data once and list every year that has expenses (most recent first).
  const base = useMemo(() => {
    const withExpenses = vehicles
      .map((v) => ({ ...v, expenses: (v.expenses || []).map((e) => ({ ...e, cost: Number(e.cost) })) }))
      .filter((v) => v.expenses.length > 0)

    const allExpenses = withExpenses.flatMap((v) => v.expenses)
    if (allExpenses.length === 0) return null

    const years = Array.from(
      new Set(allExpenses.map((e) => new Date(e.date).getFullYear())),
    ).sort((a, b) => b - a)

    return { withExpenses, years }
  }, [vehicles])

  // Default to the most recent year; reset if the current selection no longer has data.
  useEffect(() => {
    if (base && (selectedYear === null || !base.years.includes(selectedYear))) {
      setSelectedYear(base.years[0])
    }
  }, [base, selectedYear])

  // Build all stats from the selected year.
  const stats = useMemo(() => {
    if (!base || selectedYear === null) return null
    const activeYear = selectedYear
    const { withExpenses } = base

    const inYear = (e: Expense) => new Date(e.date).getFullYear() === activeYear

    const vehicleTotals = withExpenses
      .map((v) => ({
        id: v.id,
        registration: v.registration,
        total: v.expenses.filter(inYear).reduce((s, e) => s + e.cost, 0),
      }))
      .filter((v) => v.total > 0)
      .sort((a, b) => b.total - a.total)

    if (vehicleTotals.length === 0) return null

    const fleetTotal = vehicleTotals.reduce((s, v) => s + v.total, 0)
    const avgPerVehicle = fleetTotal / vehicleTotals.length

    // Monthly fleet totals (12)
    const monthly = Array.from({ length: 12 }, () => 0)
    withExpenses.flatMap((v) => v.expenses).filter(inYear).forEach((e) => {
      monthly[new Date(e.date).getMonth()] += e.cost
    })

    return {
      activeYear,
      vehicles: withExpenses,
      vehicleTotals,
      fleetTotal,
      avgPerVehicle,
      monthly,
      top: vehicleTotals[0],
    }
  }, [base, selectedYear])

  // Default the per-vehicle line chart to the most expensive vehicle; reset when the
  // current selection has no data in the chosen year.
  useEffect(() => {
    if (stats && (!selectedVehicleId || !stats.vehicleTotals.some((v) => v.id === selectedVehicleId))) {
      setSelectedVehicleId(stats.top.id)
    }
  }, [stats, selectedVehicleId])

  // Per-vehicle series grouped by the expense item actually entered.
  const itemSeries = useMemo(() => {
    if (!stats) return null
    const veh = stats.vehicles.find((v) => v.id === selectedVehicleId) || stats.vehicles[0]
    if (!veh) return null

    const groups = new Map<string, { label: string; monthly: number[] }>()
    veh.expenses
      .filter((e) => new Date(e.date).getFullYear() === stats.activeYear)
      .forEach((e) => {
        const key = normalizeItem(e.item)
        if (!groups.has(key)) {
          groups.set(key, { label: e.item.trim() || '—', monthly: Array.from({ length: 12 }, () => 0) })
        }
        groups.get(key)!.monthly[new Date(e.date).getMonth()] += e.cost
      })

    const series = Array.from(groups.values()).map((g, i) => ({
      ...g,
      color: ITEM_COLORS[i % ITEM_COLORS.length],
      total: g.monthly.reduce((s, n) => s + n, 0),
    }))
    series.sort((a, b) => b.total - a.total)
    const max = Math.max(...series.flatMap((s) => s.monthly), 1)
    return { registration: veh.registration, series, max }
  }, [stats, selectedVehicleId])

  // Render nothing until we know there is real data.
  if (loading || !stats) return null

  const year = stats.activeYear
  const monthlyMax = Math.max(...stats.monthly, 1)

  // Geometry for the SVG line chart.
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
    <div className="bg-gradient-to-br from-pictus-onyx900/40 to-pictus-black/60 rounded-3xl p-6 sm:p-8 border border-pictus-lime/30">
      <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pictus-lime/20 rounded-lg">
            <BarChart3 className="w-6 h-6 text-pictus-lime" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-light text-pictus-white">{t('analyticsTitle')}</h2>
        </div>
        {base && base.years.length > 1 && (
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-pictus-lime/10">
            {base.years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  y === stats.activeYear
                    ? 'bg-pictus-lime text-pictus-black font-medium'
                    : 'text-gray-400 hover:text-pictus-white hover:bg-white/10'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white/5 rounded-xl p-5 border border-pictus-lime/10">
          <p className="text-sm text-gray-400 mb-1">{t('analyticsTotal', { year })}</p>
          <p className="text-3xl font-light text-pictus-white">{formatCurrency(stats.fleetTotal)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-pictus-lime/10">
          <p className="text-sm text-gray-400 mb-1">{t('analyticsAvgPerVehicle')}</p>
          <p className="text-3xl font-light text-pictus-white">{formatCurrency(stats.avgPerVehicle)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {t('analyticsVehicleCount', { count: stats.vehicleTotals.length })}
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-pictus-lime/10">
          <p className="text-sm text-gray-400 mb-1">{t('analyticsTopVehicle')}</p>
          <p className="text-2xl font-light text-pictus-white">{stats.top.registration}</p>
          <p className="text-sm text-red-400 mt-1">{formatCurrency(stats.top.total)}</p>
        </div>
      </div>

      {/* Monthly fleet spend */}
      <div className="mb-10">
        <h3 className="text-lg font-normal text-pictus-white mb-4">{t('analyticsMonthly', { year })}</h3>
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
        <h3 className="text-lg font-normal text-pictus-white mb-4">{t('analyticsByVehicle', { year })}</h3>
        <div className="space-y-3">
          {stats.vehicleTotals.map((v) => {
            const aboveAvg = v.total >= stats.avgPerVehicle
            return (
              <div key={v.id} className="flex items-center gap-3">
                <span className="w-24 sm:w-28 shrink-0 text-sm text-pictus-white truncate">
                  {v.registration}
                </span>
                <div className="flex-1 bg-white/5 rounded-md h-7 overflow-hidden">
                  <div
                    className={`h-full rounded-md ${aboveAvg ? 'bg-red-500/70' : 'bg-pictus-lime/70'}`}
                    style={{ width: `${(v.total / stats.top.total) * 100}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-sm text-pictus-white">
                  {formatCurrency(v.total)}
                </span>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-500/70" /> {t('analyticsAboveAvg')}
          <span className="inline-block w-3 h-3 rounded-sm bg-pictus-lime/70 ml-3" /> {t('analyticsBelowAvg')}
        </p>
      </div>

      {/* Per-vehicle cost trend by item */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="text-lg font-normal text-pictus-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pictus-lime" />
            {t('analyticsByItem', { year })}
          </h3>
          <select
            value={selectedVehicleId || ''}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-pictus-lime/20 rounded-lg text-pictus-white text-sm focus:outline-none focus:ring-2 focus:ring-pictus-lime min-w-[150px]"
          >
            {stats.vehicleTotals.map((v) => (
              <option key={v.id} value={v.id} className="bg-pictus-black">
                {v.registration}
              </option>
            ))}
          </select>
        </div>

        {itemSeries && itemSeries.series.length > 0 && (
          <>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
              {itemSeries.series.map((s) => (
                <span key={s.label} className="flex items-center gap-1.5 text-xs text-gray-300">
                  <span className="inline-block w-3.5 h-0.5" style={{ backgroundColor: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>
            <svg viewBox={`0 0 ${LW} ${LH}`} className="w-full" style={{ height: 220 }} role="img">
              {/* horizontal gridlines */}
              {[0, 0.5, 1].map((g) => (
                <line
                  key={g}
                  x1={padL}
                  x2={LW - padR}
                  y1={padT + plotH * g}
                  y2={padT + plotH * g}
                  stroke="#ffffff"
                  strokeOpacity={0.06}
                  strokeWidth={1}
                />
              ))}
              {/* series lines */}
              {itemSeries.series.map((s) => {
                const pts = s.monthly
                  .map((val, m) => `${xAt(m)},${yAt(val, itemSeries.max)}`)
                  .join(' ')
                return (
                  <polyline
                    key={s.label}
                    points={pts}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )
              })}
              {/* month labels */}
              {monthLabels.map((lbl, m) => (
                <text
                  key={m}
                  x={xAt(m)}
                  y={LH - 6}
                  fontSize={10}
                  fill="#9ca3af"
                  textAnchor="middle"
                >
                  {lbl}
                </text>
              ))}
            </svg>
          </>
        )}
      </div>
    </div>
  )
}

export default FleetExpenseAnalytics
