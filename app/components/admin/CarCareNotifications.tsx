'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { BellRing, RefreshCw, Search, AlertCircle } from 'lucide-react'

interface Delivery {
  id: string
  org: string
  orgId: string | null
  vehicle: string
  event: string
  stage: string
  channel: string
  recipient: string
  scheduledFor: string
  sentAt: string | null
  status: string
  lastError: string | null
  dueDate: string | null
}

interface ApiResponse {
  summary: Record<string, number>
  count: number
  deliveries: Delivery[]
}

const STATUSES = ['SCHEDULED', 'SENT', 'FAILED', 'SUPPRESSED', 'CANCELLED'] as const

const STATUS_STYLE: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  SENT: 'bg-pictus-lime/15 text-pictus-lime border-pictus-lime/30',
  FAILED: 'bg-red-500/15 text-red-300 border-red-500/30',
  SUPPRESSED: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  CANCELLED: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
}

const fmt = (iso: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('sk-SK', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CarCareNotifications() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [orgQuery, setOrgQuery] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError(false)
    const qs = statusFilter ? `?status=${statusFilter}` : ''
    fetch(`/api/admin/carcare-notifications${qs}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: ApiResponse) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => {
    load()
  }, [load])

  const rows = useMemo(() => {
    if (!data) return []
    const q = orgQuery.trim().toLowerCase()
    if (!q) return data.deliveries
    return data.deliveries.filter(
      (d) =>
        d.org.toLowerCase().includes(q) ||
        d.vehicle.toLowerCase().includes(q) ||
        d.recipient.toLowerCase().includes(q),
    )
  }, [data, orgQuery])

  const summaryTotal = useMemo(
    () => (data ? Object.values(data.summary).reduce((a, b) => a + b, 0) : 0),
    [data],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-xl">
            <BellRing className="w-6 h-6 text-pictus-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">FleetSync Notifications</h1>
            <p className="text-sm text-gray-400">
              CarCare notification deliveries across all organizations
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Status summary chips (double as filter) */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm border ${
            statusFilter === ''
              ? 'bg-pictus-lime/15 text-pictus-lime border-pictus-lime/30'
              : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
          }`}
        >
          All <span className="opacity-70">({summaryTotal})</span>
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              statusFilter === s
                ? STATUS_STYLE[s]
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            {s} <span className="opacity-70">({data?.summary[s] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={orgQuery}
          onChange={(e) => setOrgQuery(e.target.value)}
          placeholder="Filter by organization, vehicle or recipient…"
          className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-pictus-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pictus-lime"
        />
      </div>

      {error ? (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
          <AlertCircle className="w-5 h-5" /> Failed to load notifications.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Organization</th>
                <th className="px-3 py-2 font-medium">Vehicle</th>
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">Stage</th>
                <th className="px-3 py-2 font-medium">Channel</th>
                <th className="px-3 py-2 font-medium">Recipient</th>
                <th className="px-3 py-2 font-medium">Scheduled</th>
                <th className="px-3 py-2 font-medium">Sent</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((d) => (
                <tr key={d.id} className="hover:bg-white/5">
                  <td className="px-3 py-2">{d.org}</td>
                  <td className="px-3 py-2 font-medium">{d.vehicle}</td>
                  <td className="px-3 py-2">{d.event}</td>
                  <td className="px-3 py-2 text-gray-400">{d.stage}</td>
                  <td className="px-3 py-2 text-gray-400">{d.channel}</td>
                  <td className="px-3 py-2 text-gray-300">{d.recipient}</td>
                  <td className="px-3 py-2 text-gray-300 whitespace-nowrap">
                    {fmt(d.scheduledFor)}
                  </td>
                  <td className="px-3 py-2 text-gray-300 whitespace-nowrap">{fmt(d.sentAt)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs border ${
                        STATUS_STYLE[d.status] ?? 'bg-white/5 text-gray-300 border-white/10'
                      }`}
                      title={d.lastError ?? undefined}
                    >
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-gray-500">
                    No notifications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && (
        <p className="text-xs text-gray-500">
          Showing {rows.length} of {data.count} loaded (most recent first, capped at 300).
        </p>
      )}
    </div>
  )
}
