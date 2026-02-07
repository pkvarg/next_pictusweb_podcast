'use client'
import { useEffect, useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { FaEuroSign } from 'react-icons/fa'

interface Expense {
  id: string
  item: string
  cost: number
  date: string
  createdAt: string
}

interface ExpensesModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleId: string
  vehicleRegistration: string
}

const ExpensesModal = ({ isOpen, onClose, vehicleId, vehicleRegistration }: ExpensesModalProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    item: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchExpenses()
    }
  }, [isOpen])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/my-vehicles/${vehicleId}/expenses`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (err) {
      console.error('Error fetching expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.item || !formData.cost || !formData.date) {
      setError('Všetky polia sú povinné')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/my-vehicles/${vehicleId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to add expense')
      }

      // Reset form
      setFormData({
        item: '',
        cost: '',
        date: new Date().toISOString().split('T')[0],
      })

      // Refresh list
      await fetchExpenses()
    } catch (err) {
      console.error('Error adding expense:', err)
      setError('Nepodarilo sa pridať výdavok')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Naozaj chcete odstrániť tento výdavok?')) {
      return
    }

    try {
      const response = await fetch(`/api/my-vehicles/${vehicleId}/expenses/${expenseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }

      // Refresh list
      await fetchExpenses()
    } catch (err) {
      console.error('Error deleting expense:', err)
      alert('Nepodarilo sa odstrániť výdavok')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const calculateTotal = () => {
    return expenses.reduce((sum, expense) => sum + Number(expense.cost), 0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-black border border-purple-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600/20 to-purple-800/20 border-b border-purple-500/30 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <FaEuroSign className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white">Výdavky</h2>
              <p className="text-xl text-purple-300">{vehicleRegistration}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition">
            <X className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add Expense Form */}
          <form
            onSubmit={handleSubmit}
            className="mb-6 bg-purple-600/10 rounded-xl p-6 border border-purple-500/20"
          >
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
              <Plus size={28} className="text-purple-400" />
              Pridať výdavok
            </h3>

            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-200 text-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-white text-lg font-medium mb-2">Položka *</label>
                <input
                  type="text"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  placeholder="napr. Palivo, Servis..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-lg font-medium mb-2">Suma (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-white text-lg font-medium mb-2">Dátum *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all disabled:opacity-50 text-lg font-medium"
                >
                  {loading ? 'Ukladám...' : 'Pridať výdavok'}
                </button>
              </div>
            </div>
          </form>

          {/* Expenses List */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white">
                História výdavkov ({expenses.length})
              </h3>
              {expenses.length > 1 && (
                <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg px-6 py-3">
                  <p className="text-purple-300 text-sm">Celkom</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(calculateTotal())}</p>
                </div>
              )}
            </div>

            {loading && expenses.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-purple-300 text-xl">Zatiaľ žiadne výdavky</div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-purple-600/10 border border-purple-500/20 rounded-lg p-5 flex items-center justify-between hover:bg-purple-600/20 transition"
                  >
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-xl">{expense.item}</h4>
                      <p className="text-purple-400 text-base">{formatDate(expense.date)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-white">
                        {formatCurrency(Number(expense.cost))}
                      </span>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="p-3 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition text-red-400"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
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

export default ExpensesModal
