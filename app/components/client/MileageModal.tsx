'use client'
import { useEffect, useState, useCallback } from 'react'
import { X, Plus, Trash2, Gauge } from 'lucide-react'

interface MileageRecord {
  id: string
  kilometers: number
  date: string
  note: string | null
  createdAt: string
}

interface MileageModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleId: string
  vehicleRegistration: string
  onSuccess?: () => void
}

const MileageModal = ({ isOpen, onClose, vehicleId, vehicleRegistration, onSuccess }: MileageModalProps) => {
  const [mileageRecords, setMileageRecords] = useState<MileageRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    kilometers: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  })
  const [error, setError] = useState('')

  const fetchMileage = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/my-vehicles/${vehicleId}/mileage`)
      if (response.ok) {
        const data = await response.json()
        setMileageRecords(data)
      }
    } catch (err) {
      console.error('Error fetching mileage:', err)
    } finally {
      setLoading(false)
    }
  }, [vehicleId])

  useEffect(() => {
    if (isOpen) {
      fetchMileage()
    }
  }, [isOpen, fetchMileage])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.kilometers || !formData.date) {
      setError('Kilometre a dátum sú povinné')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/my-vehicles/${vehicleId}/mileage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to add mileage record')
      }

      // Reset form
      setFormData({
        kilometers: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
      })

      // Refresh list
      await fetchMileage()

      // Call onSuccess callback to refresh parent data
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error adding mileage:', err)
      setError('Nepodarilo sa pridať záznam')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (mileageId: string) => {
    if (!confirm('Naozaj chcete odstrániť tento záznam?')) {
      return
    }

    try {
      const response = await fetch(`/api/my-vehicles/${vehicleId}/mileage/${mileageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete mileage record')
      }

      // Refresh list
      await fetchMileage()

      // Call onSuccess callback to refresh parent data
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error deleting mileage:', err)
      alert('Nepodarilo sa odstrániť záznam')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK')
  }

  const formatKilometers = (km: number) => {
    return new Intl.NumberFormat('sk-SK').format(km) + ' km'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black border border-pictus-lime/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pictus-lime/20 to-pictus-lime600/20 border-b border-pictus-lime/30 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pictus-lime/20 rounded-lg">
              <Gauge className="w-8 h-8 text-pictus-lime" />
            </div>
            <div>
              <h2 className="text-4xl font-light text-pictus-white">Kilometre</h2>
              <p className="text-xl text-pictus-lime">{vehicleRegistration}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-8 h-8 text-pictus-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add Mileage Form */}
          <form onSubmit={handleSubmit} className="mb-6 bg-gray-600/20 rounded-xl p-6 border border-pictus-lime/20">
            <h3 className="text-2xl font-light text-pictus-white mb-6 flex items-center gap-2">
              <Plus size={28} className="text-pictus-lime" />
              Pridať záznam
            </h3>

            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-200 text-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-pictus-white text-lg font-light mb-2">
                  Kilometre *
                </label>
                <input
                  type="number"
                  value={formData.kilometers}
                  onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })}
                  placeholder="napr. 150000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-pictus-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-pictus-white text-lg font-light mb-2">
                  Dátum *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-pictus-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-pictus-white text-lg font-light mb-2">
                  Poznámka
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Voliteľná poznámka..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-pictus-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black px-6 py-3 rounded-lg hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all disabled:opacity-50 text-lg font-light shadow-lg hover:shadow-pictus-lime/50"
                >
                  {loading ? 'Ukladám...' : 'Pridať záznam'}
                </button>
              </div>
            </div>
          </form>

          {/* Mileage List */}
          <div>
            <h3 className="text-2xl font-light text-pictus-white mb-6">
              História ({mileageRecords.length})
            </h3>

            {loading && mileageRecords.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              </div>
            ) : mileageRecords.length === 0 ? (
              <div className="text-center py-8 text-pictus-lime text-xl">
                Zatiaľ žiadne záznamy
              </div>
            ) : (
              <div className="space-y-4">
                {mileageRecords.map((record) => (
                  <div
                    key={record.id}
                    className="bg-gray-600/20 border border-pictus-lime/20 rounded-lg p-5 flex items-center justify-between hover:bg-pictus-lime/20 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-light text-pictus-white">
                          {formatKilometers(record.kilometers)}
                        </span>
                        <span className="text-pictus-lime text-lg">•</span>
                        <span className="text-pictus-lime text-base">{formatDate(record.date)}</span>
                      </div>
                      {record.note && (
                        <p className="text-pictus-lime text-base mt-1">{record.note}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-3 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition text-red-400"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MileageModal
