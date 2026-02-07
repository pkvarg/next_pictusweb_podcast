'use client'
import { useEffect, useState } from 'react'
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
}

const MileageModal = ({ isOpen, onClose, vehicleId, vehicleRegistration }: MileageModalProps) => {
  const [mileageRecords, setMileageRecords] = useState<MileageRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    kilometers: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchMileage()
    }
  }, [isOpen])

  const fetchMileage = async () => {
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
  }

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
      <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-black border border-purple-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600/20 to-purple-800/20 border-b border-purple-500/30 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Gauge className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white">Kilometre</h2>
              <p className="text-xl text-purple-300">{vehicleRegistration}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add Mileage Form */}
          <form onSubmit={handleSubmit} className="mb-6 bg-purple-600/10 rounded-xl p-6 border border-purple-500/20">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Plus size={28} className="text-purple-400" />
              Pridať záznam
            </h3>

            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-200 text-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-lg font-medium mb-2">
                  Kilometre *
                </label>
                <input
                  type="number"
                  value={formData.kilometers}
                  onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })}
                  placeholder="napr. 150000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-lg font-medium mb-2">
                  Dátum *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-white text-lg font-medium mb-2">
                  Poznámka
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Voliteľná poznámka..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-50 text-lg font-medium"
                >
                  {loading ? 'Ukladám...' : 'Pridať záznam'}
                </button>
              </div>
            </div>
          </form>

          {/* Mileage List */}
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">
              História ({mileageRecords.length})
            </h3>

            {loading && mileageRecords.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              </div>
            ) : mileageRecords.length === 0 ? (
              <div className="text-center py-8 text-purple-300 text-xl">
                Zatiaľ žiadne záznamy
              </div>
            ) : (
              <div className="space-y-4">
                {mileageRecords.map((record) => (
                  <div
                    key={record.id}
                    className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-5 flex items-center justify-between hover:bg-purple-600/20 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">
                          {formatKilometers(record.kilometers)}
                        </span>
                        <span className="text-purple-400 text-lg">•</span>
                        <span className="text-purple-400 text-base">{formatDate(record.date)}</span>
                      </div>
                      {record.note && (
                        <p className="text-purple-300 text-base mt-1">{record.note}</p>
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
