'use client'

import { useCallback, useEffect, useState } from 'react'
import { RotateCcw, Loader, Inbox } from 'lucide-react'

interface DismissedRenewal {
  dutyBatchId: string
  vehicleRegistration: string
  notificationType: string
  originalDutyDate: string | null
  organizationName: string | null
  dismissedAt: string | null
}

export default function DismissedRenewals() {
  const [renewals, setRenewals] = useState<DismissedRenewal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [restoringId, setRestoringId] = useState<string | null>(null)

  const fetchDismissed = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/duty-renewals?status=dismissed&organizationId=all')
      if (!response.ok) {
        throw new Error('Failed to load dismissed renewals')
      }
      const data = await response.json()
      setRenewals(data.dutyBatches || [])
    } catch (err) {
      console.error('Error fetching dismissed renewals:', err)
      setError('Failed to load dismissed renewals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDismissed()
  }, [fetchDismissed])

  const handleRestore = async (renewal: DismissedRenewal) => {
    setRestoringId(renewal.dutyBatchId)
    try {
      const response = await fetch('/api/duty-renewals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dutyBatchId: renewal.dutyBatchId }),
      })
      if (response.ok) {
        await fetchDismissed()
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to restore' }))
        alert(data.error || 'Failed to restore renewal')
      }
    } catch (err) {
      console.error('Error restoring renewal:', err)
      alert('Error restoring renewal')
    } finally {
      setRestoringId(null)
    }
  }

  const formatDate = (value: string | null) => {
    if (!value) return '—'
    return new Date(value).toLocaleString('sk-SK', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <Loader className="w-5 h-5 animate-spin mr-2" />
        Loading dismissed renewals...
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Inbox className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold text-white">Dismissed Renewals</h2>
          <span className="text-sm text-gray-400">({renewals.length})</span>
        </div>
        <button
          onClick={fetchDismissed}
          className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
          {error}
        </div>
      )}

      {renewals.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No dismissed renewals.</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {renewals.map((renewal) => (
              <div
                key={renewal.dutyBatchId}
                className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{renewal.vehicleRegistration}</span>
                  <span className="text-xs text-gray-400">{renewal.notificationType}</span>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>{renewal.organizationName || '—'}</div>
                  <div>Pôvodný termín: {formatDate(renewal.originalDutyDate)}</div>
                  <div>Zrušené: {formatDate(renewal.dismissedAt)}</div>
                </div>
                <button
                  onClick={() => handleRestore(renewal)}
                  disabled={restoringId === renewal.dutyBatchId}
                  className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 text-sm bg-pictus-lime hover:bg-pictus-lime600 disabled:opacity-50 text-pictus-black font-semibold rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  {restoringId === renewal.dutyBatchId ? 'Restoring...' : 'Restore'}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-sm font-medium text-gray-400">Vehicle</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Type</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Organization</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Original duty</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Dismissed</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {renewals.map((renewal) => (
                  <tr
                    key={renewal.dutyBatchId}
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >
                    <td className="py-3 text-sm text-white font-medium">
                      {renewal.vehicleRegistration}
                    </td>
                    <td className="py-3 text-sm text-gray-300">{renewal.notificationType}</td>
                    <td className="py-3 text-sm text-gray-300">
                      {renewal.organizationName || '—'}
                    </td>
                    <td className="py-3 text-sm text-gray-300">
                      {formatDate(renewal.originalDutyDate)}
                    </td>
                    <td className="py-3 text-sm text-gray-300">
                      {formatDate(renewal.dismissedAt)}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleRestore(renewal)}
                        disabled={restoringId === renewal.dutyBatchId}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-pictus-lime hover:bg-pictus-lime600 disabled:opacity-50 text-pictus-black font-semibold rounded transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        {restoringId === renewal.dutyBatchId ? 'Restoring...' : 'Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
