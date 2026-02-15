'use client'
import { useState, useEffect, useCallback } from 'react'
import { Calendar, Check, Edit, X, Loader, AlertCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import RenewalModal from './RenewalModal'

interface VehicleNotification {
  id: number
  dutyBatchId: string | null
  isPdr: boolean
  pdrReminderFor: string | null
  renewedFromBatchId: string | null
  organizationId: string | null
  vehicleRegistration: string | null
  notificationType: string | null
  notificationChannel: string | null
  notificationDate: string | null
  dutyDate: string | null
  emailMessage: string | null
  status: string
  personName: string | null
  email: string | null
  phoneNumber: string | null
  userId: string | null
  myVehicleId: string | null
}

interface DutyBatch {
  dutyBatchId: string
  vehicleRegistration: string
  notificationType: string
  originalDutyDate: string
  allNotifications: VehicleNotification[]
  intervalsUsed: number[]
  isPdrType: boolean
  pdrReminder: VehicleNotification
  status: 'pending' | 'completed'
}

interface RenewalCardProps {
  dutyBatch: DutyBatch
  onRenewalSuccess: () => void
}

interface RenewalPreset {
  id: string
  presetMonths: string
  presetLabels: string
  defaultPresetIndex: number
  isDefault?: boolean
}

const RenewalCard = ({ dutyBatch, onRenewalSuccess }: RenewalCardProps) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedPresetMonths, setSelectedPresetMonths] = useState<number | null>(null)
  const [customDate, setCustomDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [presets, setPresets] = useState<RenewalPreset[]>([])
  const [loadingPresets, setLoadingPresets] = useState(true)
  const [expanded, setExpanded] = useState(false)

  const fetchPresets = useCallback(async () => {
    setLoadingPresets(true)
    try {
      const orgId = dutyBatch.allNotifications[0]?.organizationId
      if (!orgId) return

      const response = await fetch(
        `/api/duty-renewal-presets?organizationId=${orgId}&notificationType=${encodeURIComponent(dutyBatch.notificationType)}`
      )

      if (response.ok) {
        const data = await response.json()
        setPresets(data.presets || [])
      }
    } catch (error) {
      console.error('Error fetching presets:', error)
    } finally {
      setLoadingPresets(false)
    }
  }, [dutyBatch.allNotifications, dutyBatch.notificationType])

  // Fetch presets when component mounts
  useEffect(() => {
    fetchPresets()
  }, [fetchPresets])

  const handleQuickRenew = async (months: number) => {
    setCreating(true)
    setError('')
    setSuccess(false)

    try {
      // Calculate new duty date
      const originalDate = new Date(dutyBatch.originalDutyDate)
      const newDate = new Date(originalDate)
      newDate.setMonth(newDate.getMonth() + months)

      const response = await fetch('/api/duty-renewals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceBatchId: dutyBatch.dutyBatchId,
          newDutyDate: newDate.toISOString().split('T')[0],
          customIntervals: dutyBatch.intervalsUsed,
        }),
      })

      if (!response.ok) {
        throw new Error('Nepodarilo sa vytvoriť obnovu')
      }

      setSuccess(true)
      setTimeout(() => {
        onRenewalSuccess()
      }, 1500)
    } catch (error) {
      console.error('Error creating renewal:', error)
      setError('Nepodarilo sa vytvoriť obnovu')
    } finally {
      setCreating(false)
    }
  }

  const handleCustomRenew = async () => {
    if (!customDate) {
      setError('Vyberte dátum')
      return
    }

    setCreating(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/duty-renewals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceBatchId: dutyBatch.dutyBatchId,
          newDutyDate: customDate,
          customIntervals: dutyBatch.intervalsUsed,
        }),
      })

      if (!response.ok) {
        throw new Error('Nepodarilo sa vytvoriť obnovu')
      }

      setSuccess(true)
      setTimeout(() => {
        onRenewalSuccess()
      }, 1500)
    } catch (error) {
      console.error('Error creating renewal:', error)
      setError('Nepodarilo sa vytvoriť obnovu')
    } finally {
      setCreating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const calculateNewDate = (months: number) => {
    const originalDate = new Date(dutyBatch.originalDutyDate)
    const newDate = new Date(originalDate)
    newDate.setMonth(newDate.getMonth() + months)
    return formatDate(newDate.toISOString())
  }

  const getPresetButtons = () => {
    if (presets.length === 0) return []

    const preset = presets[0]
    const months = preset.presetMonths.split(',').map(m => parseInt(m.trim()))
    const labels = preset.presetLabels.split(',').map(l => l.trim())

    return months.map((month, index) => ({
      months: month,
      label: labels[index] || `+${month} mesiacov`,
    }))
  }

  const presetButtons = getPresetButtons()

  return (
    <div
      className={`bg-white/5 border ${
        dutyBatch.status === 'pending' ? 'border-blue-500/30' : 'border-white/10'
      } rounded-xl overflow-hidden transition-all ${success ? 'animate-pulse' : ''}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-light text-pictus-white">
                {dutyBatch.vehicleRegistration}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  dutyBatch.status === 'pending'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}
              >
                {dutyBatch.status === 'pending' ? '⏰ Čakajúce' : '✅ Dokončené'}
              </span>
            </div>
            <p className="text-lg text-gray-400">{dutyBatch.notificationType}</p>
            <p className="text-sm text-gray-500 mt-1">
              Pôvodný termín: {formatDate(dutyBatch.originalDutyDate)}
            </p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Details (Expandable) */}
      {expanded && (
        <div className="p-6 bg-white/5 border-b border-white/10">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Odoslané notifikácie:</h4>
          <div className="space-y-2">
            {dutyBatch.intervalsUsed.map((interval, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={14} />
                <span>
                  {interval === 0
                    ? 'V deň úlohy'
                    : interval > 0
                    ? `${interval} dni po úlohe`
                    : `${Math.abs(interval)} dni pred úlohou`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Renew Section */}
      {dutyBatch.status === 'pending' && !success && (
        <div className="p-6">
          {loadingPresets ? (
            <div className="flex items-center justify-center py-4">
              <Loader className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="ml-2 text-gray-400">Načítavam predvoľby...</span>
            </div>
          ) : (
            <>
              {/* Intervals Information */}
              <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  Obnova vytvorí {dutyBatch.intervalsUsed.length} notifikácií s týmito intervalmi:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dutyBatch.intervalsUsed.sort((a, b) => a - b).map((interval, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-pictus-lime/20 border border-pictus-lime/30 rounded-lg text-pictus-lime text-sm"
                    >
                      {interval === 0
                        ? 'V deň úlohy'
                        : interval > 0
                        ? `+${interval} dní`
                        : `${interval} dní`}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Môžete zmeniť intervaly pomocou tlačidla &quot;Upraviť detaily&quot; nižšie
                </p>
              </div>

              <h4 className="text-sm font-medium text-gray-400 mb-4">Rýchla obnova:</h4>

              {/* Preset Buttons */}
              {presetButtons.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {presetButtons.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickRenew(preset.months)}
                      disabled={creating}
                      className="p-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="text-left">
                        <div className="text-pictus-white font-light mb-1">{preset.label}</div>
                        <div className="text-sm text-blue-400">
                          {calculateNewDate(preset.months)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Custom Date */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Alebo vlastný dátum:
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-pictus-white focus:outline-none focus:border-pictus-lime disabled:opacity-50"
                  />
                  <button
                    onClick={handleCustomRenew}
                    disabled={creating || !customDate}
                    className="px-6 py-2 bg-pictus-lime hover:bg-pictus-lime600 text-pictus-darkest font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {creating ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Vytváram...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Vytvoriť
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Edit Details Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowModal(true)}
                  disabled={creating}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-pictus-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-50"
                >
                  <Edit size={16} />
                  Upraviť detaily
                </button>
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-6 bg-green-500/20 border-t border-green-500/30">
          <div className="flex items-center gap-3 text-green-400">
            <Check className="w-6 h-6" />
            <p className="text-lg font-light">Obnova úspešne vytvorená!</p>
          </div>
        </div>
      )}

      {/* Renewal Modal */}
      {showModal && (
        <RenewalModal
          dutyBatch={dutyBatch}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            onRenewalSuccess()
          }}
        />
      )}
    </div>
  )
}

export default RenewalCard
