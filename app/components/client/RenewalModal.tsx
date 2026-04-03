'use client'
import { useState, useEffect, useCallback } from 'react'
import { X, Calendar, Check, Loader, AlertCircle, Edit } from 'lucide-react'

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

interface RenewalModalProps {
  dutyBatch: DutyBatch
  onClose: () => void
  onSuccess: () => void
}

interface RenewalPreset {
  id: string
  presetMonths: string
  presetLabels: string
  defaultPresetIndex: number
  isDefault?: boolean
}

const RenewalModal = ({ dutyBatch, onClose, onSuccess }: RenewalModalProps) => {
  const [newDutyDate, setNewDutyDate] = useState('')
  const [editedData, setEditedData] = useState({
    vehicleRegistration: dutyBatch.vehicleRegistration,
    notificationType: dutyBatch.notificationType,
    personName: dutyBatch.allNotifications[0]?.personName || '',
    email: dutyBatch.allNotifications[0]?.email || '',
    phoneNumber: dutyBatch.allNotifications[0]?.phoneNumber || '',
    emailMessage: dutyBatch.allNotifications[0]?.emailMessage || '',
  })
  const [customIntervals, setCustomIntervals] = useState<number[]>(dutyBatch.intervalsUsed)
  const [showIntervalsEditor, setShowIntervalsEditor] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [presets, setPresets] = useState<RenewalPreset[]>([])
  const [loadingPresets, setLoadingPresets] = useState(true)

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

  // Fetch presets
  useEffect(() => {
    fetchPresets()
  }, [fetchPresets])

  const handlePresetClick = (months: number) => {
    const originalDate = new Date(dutyBatch.originalDutyDate)
    const newDate = new Date(originalDate)
    newDate.setMonth(newDate.getMonth() + months)
    setNewDutyDate(newDate.toISOString().split('T')[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDutyDate) {
      setError('Vyberte nový dátum úlohy')
      return
    }

    setCreating(true)
    setError('')

    try {
      const response = await fetch('/api/duty-renewals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceBatchId: dutyBatch.dutyBatchId,
          newDutyDate,
          editedData,
          customIntervals,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        if (response.status === 403 && errorData?.limitReached) {
          alert(errorData.error)
          window.location.reload()
          return
        }
        if (response.status === 403 && errorData?.error) {
          throw new Error(errorData.error)
        }
        throw new Error('Nepodarilo sa vytvoriť obnovu')
      }

      const data = await response.json()
      console.log('Renewal created:', data)
      onSuccess()
    } catch (error: any) {
      console.error('Error creating renewal:', error)
      setError(error?.message || 'Nepodarilo sa vytvoriť obnovu')
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

  // Preview notification dates
  const getPreviewDates = () => {
    if (!newDutyDate) return []

    const newDate = new Date(newDutyDate)
    return customIntervals.map(interval => {
      const notifDate = new Date(newDate)
      notifDate.setDate(notifDate.getDate() + interval)
      return {
        interval,
        date: formatDate(notifDate.toISOString()),
      }
    })
  }

  const previewDates = getPreviewDates()

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-pictus-darkest border border-white/10 rounded-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-light text-pictus-white">Upraviť a obnoviť úlohu</h2>
            <p className="text-gray-400 mt-1">
              {dutyBatch.vehicleRegistration} - {dutyBatch.notificationType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Date Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Nový dátum úlohy
            </label>

            {/* Preset Buttons */}
            {!loadingPresets && presetButtons.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {presetButtons.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetClick(preset.months)}
                    className="p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg transition-all"
                  >
                    <div className="text-left">
                      <div className="text-pictus-white font-light text-sm mb-1">
                        {preset.label}
                      </div>
                      <div className="text-xs text-blue-400">
                        {calculateNewDate(preset.months)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Date Picker */}
            <input
              type="date"
              value={newDutyDate}
              onChange={(e) => setNewDutyDate(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-pictus-white focus:outline-none focus:border-pictus-lime"
            />
          </div>

          {/* Intervals Editor */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">
                Intervaly notifikácií ({customIntervals.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowIntervalsEditor(!showIntervalsEditor)}
                className="text-xs text-pictus-lime hover:text-pictus-lime400 transition-colors"
              >
                {showIntervalsEditor ? '✓ Hotovo' : '✏️ Upraviť intervaly'}
              </button>
            </div>

            {!showIntervalsEditor ? (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {customIntervals.sort((a, b) => a - b).map((interval, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-pictus-lime/20 border border-pictus-lime/30 rounded-lg text-pictus-lime text-sm"
                    >
                      {interval === 0
                        ? 'V deň úlohy'
                        : interval > 0
                        ? `+${interval} dní`
                        : `${interval} dní`}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
                {customIntervals.map((interval, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={interval}
                      onChange={(e) => {
                        const newIntervals = [...customIntervals]
                        newIntervals[index] = parseInt(e.target.value)
                        setCustomIntervals(newIntervals)
                      }}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                    >
                      {Array.from({ length: 33 }, (_, i) => -30 + i).map((day) => (
                        <option key={day} value={day}>
                          {day === 0
                            ? 'V deň úlohy'
                            : day < 0
                            ? `${Math.abs(day)} ${Math.abs(day) === 1 ? 'deň' : Math.abs(day) < 5 ? 'dni' : 'dní'} pred`
                            : `${day} ${day === 1 ? 'deň' : day < 5 ? 'dni' : 'dní'} po`}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomIntervals(customIntervals.filter((_, i) => i !== index))
                      }}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setCustomIntervals([...customIntervals, 0])}
                  className="w-full py-2 bg-pictus-lime/20 hover:bg-pictus-lime/30 text-pictus-lime border border-pictus-lime/30 rounded-lg transition-all text-sm"
                >
                  + Pridať interval
                </button>
              </div>
            )}
          </div>

          {/* Editable Fields */}
          <div className="mb-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Upraviť detaily</h3>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Evidenčné číslo</label>
              <input
                type="text"
                value={editedData.vehicleRegistration}
                onChange={(e) =>
                  setEditedData({ ...editedData, vehicleRegistration: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-pictus-white focus:outline-none focus:border-pictus-lime"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Typ notifikácie</label>
              <input
                type="text"
                value={editedData.notificationType}
                onChange={(e) =>
                  setEditedData({ ...editedData, notificationType: e.target.value })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-pictus-white focus:outline-none focus:border-pictus-lime"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Meno osoby</label>
              <input
                type="text"
                value={editedData.personName}
                onChange={(e) => setEditedData({ ...editedData, personName: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-pictus-white focus:outline-none focus:border-pictus-lime"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-pictus-white focus:outline-none focus:border-pictus-lime"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Telefón</label>
                <input
                  type="tel"
                  value={editedData.phoneNumber}
                  onChange={(e) =>
                    setEditedData({ ...editedData, phoneNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-pictus-white focus:outline-none focus:border-pictus-lime"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Správa</label>
              <textarea
                value={editedData.emailMessage}
                onChange={(e) => setEditedData({ ...editedData, emailMessage: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-pictus-white focus:outline-none focus:border-pictus-lime resize-none"
              />
            </div>
          </div>

          {/* Preview */}
          {newDutyDate && previewDates.length > 0 && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="text-sm font-medium text-blue-400 mb-3">
                Náhľad: {previewDates.length} notifikácií + 1 PDR pripomienka
              </h4>
              <div className="space-y-2">
                {previewDates.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar size={14} />
                    <span>
                      {item.date} -{' '}
                      {item.interval === 0
                        ? 'V deň úlohy'
                        : item.interval > 0
                        ? `${item.interval} dni po`
                        : `${Math.abs(item.interval)} dni pred`}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm text-blue-400 border-t border-blue-500/20 pt-2 mt-2">
                  <Calendar size={14} />
                  <span>
                    {formatDate(
                      new Date(new Date(newDutyDate).getTime() + 86400000).toISOString()
                    )}{' '}
                    - PDR pripomienka (1 deň po)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-pictus-white rounded-lg transition-all disabled:opacity-50"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={creating || !newDutyDate}
              className="flex-1 px-6 py-3 bg-pictus-lime hover:bg-pictus-lime600 text-pictus-darkest font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Vytváram...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Vytvoriť ďalšiu úlohu
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

export default RenewalModal
