'use client'
import { useEffect, useState, useCallback } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { FaEuroSign } from 'react-icons/fa'

interface Expense {
  id: string
  item: string
  cost: number
  date: string
  note: string | null
  link: string | null
  createdAt: string
}

interface ExpensesModalProps {
  isOpen: boolean
  onClose: () => void
  vehicleId: string
  vehicleRegistration: string
  onSuccess?: () => void
}

const ExpensesModal = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleRegistration,
  onSuccess,
}: ExpensesModalProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    item: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    link: '',
  })
  const [error, setError] = useState('')
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    item: '',
    cost: '',
    date: '',
    note: '',
    link: '',
  })

  const fetchExpenses = useCallback(async () => {
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
  }, [vehicleId])

  useEffect(() => {
    if (isOpen) {
      fetchExpenses()
    }
  }, [isOpen, fetchExpenses])

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
        note: '',
        link: '',
      })

      // Refresh list
      await fetchExpenses()

      // Call onSuccess callback to refresh parent data
      if (onSuccess) {
        onSuccess()
      }
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

      // Call onSuccess callback to refresh parent data
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error deleting expense:', err)
      alert('Nepodarilo sa odstrániť výdavok')
    }
  }

  const startEditExpense = (expense: Expense) => {
    setEditingExpenseId(expense.id)
    setEditFormData({
      item: expense.item,
      cost: String(expense.cost),
      date: new Date(expense.date).toISOString().split('T')[0],
      note: expense.note || '',
      link: expense.link || '',
    })
  }

  const handleSaveEdit = async () => {
    if (!editingExpenseId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/my-vehicles/${vehicleId}/expenses/${editingExpenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })

      if (!response.ok) throw new Error('Failed to update expense')

      setEditingExpenseId(null)
      await fetchExpenses()
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Error updating expense:', err)
      alert('Nepodarilo sa upraviť výdavok')
    } finally {
      setLoading(false)
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
      <div className="bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black border border-white/[0.06] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pictus-lime/15 to-pictus-lime600/10 border-b border-white/[0.06] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pictus-lime/15 rounded-xl">
              <FaEuroSign className="w-8 h-8 text-pictus-lime" />
            </div>
            <div>
              <h2 className="text-4xl font-light text-pictus-white">Výdavky</h2>
              <p className="text-xl text-pictus-lime">{vehicleRegistration}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X className="w-8 h-8 text-pictus-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Add Expense Form */}
          <form
            onSubmit={handleSubmit}
            className="mb-6 bg-white/5 rounded-2xl p-6 border border-white/[0.06]"
          >
            <h3 className="text-2xl font-light text-pictus-white mb-6 flex items-center gap-2">
              <Plus size={28} className="text-pictus-lime" />
              Pridať výdavok
            </h3>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-200 text-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-pictus-white text-lg font-light mb-2">Položka *</label>
                <input
                  type="text"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  placeholder="napr. Palivo, Servis..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-pictus-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime"
                  required
                />
              </div>
              <div>
                <label className="block text-pictus-white text-lg font-light mb-2">
                  Suma (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-pictus-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime"
                  required
                />
              </div>
              <div>
                <label className="block text-pictus-white text-lg font-light mb-2">Dátum *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-pictus-white text-lg focus:outline-none focus:ring-2 focus:ring-pictus-lime"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-pictus-white text-lg font-light mb-2">Poznámka</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="voliteľná poznámka"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-pictus-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime"
                />
              </div>
              <div>
                <label className="block text-pictus-white text-lg font-light mb-2">
                  Link napr. na obdchod
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-pictus-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-pictus-lime text-pictus-black px-6 py-3 rounded-full hover:bg-pictus-lime600 transition-all disabled:opacity-50 text-lg font-semibold"
                >
                  {loading ? 'Ukladám...' : 'Pridať výdavok'}
                </button>
              </div>
            </div>
          </form>

          {/* Expenses List */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-light text-pictus-white">
                História výdavkov ({expenses.length})
              </h3>
              {expenses.length > 1 && (
                <div className="bg-pictus-lime/15 border border-pictus-lime/25 rounded-2xl px-6 py-3">
                  <p className="text-pictus-lime text-sm">Celkom</p>
                  <p className="text-3xl font-light text-pictus-white">
                    {formatCurrency(calculateTotal())}
                  </p>
                </div>
              )}
            </div>

            {loading && expenses.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pictus-lime mx-auto"></div>
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center py-8 text-pictus-lime text-xl">Zatiaľ žiadne výdavky</div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-white/5 border border-white/[0.06] rounded-2xl p-5 hover:bg-white/10 transition"
                  >
                    {editingExpenseId === expense.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={editFormData.item}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, item: e.target.value })
                            }
                            className="col-span-2 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pictus-lime"
                            placeholder="Položka"
                          />
                          <input
                            type="number"
                            step="0.01"
                            value={editFormData.cost}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, cost: e.target.value })
                            }
                            className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pictus-lime"
                            placeholder="Suma"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            type="date"
                            value={editFormData.date}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, date: e.target.value })
                            }
                            className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pictus-lime"
                          />
                          <input
                            type="text"
                            value={editFormData.note}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, note: e.target.value })
                            }
                            className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pictus-lime"
                            placeholder="Poznámka"
                          />
                          <input
                            type="url"
                            value={editFormData.link}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, link: e.target.value })
                            }
                            className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pictus-lime"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-5 py-2 bg-pictus-lime hover:bg-pictus-lime600 text-pictus-black font-semibold rounded-full transition text-sm"
                          >
                            Uložiť
                          </button>
                          <button
                            onClick={() => setEditingExpenseId(null)}
                            className="px-5 py-2 bg-white/5 hover:bg-white/10 text-pictus-white rounded-full transition text-sm"
                          >
                            Zrušiť
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-pictus-white font-light text-xl">{expense.item}</h4>
                            <p className="text-pictus-lime text-base">{formatDate(expense.date)}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-2xl font-light text-pictus-white">
                              {formatCurrency(Number(expense.cost))}
                            </span>
                            <button
                              onClick={() => startEditExpense(expense)}
                              className="p-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition text-blue-400"
                            >
                              <Plus size={20} className="rotate-45" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition text-red-400"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        {(expense.note || expense.link) && (
                          <div className="mt-2 flex gap-4 text-sm">
                            {expense.note && (
                              <span className="text-gray-400 italic">{expense.note}</span>
                            )}
                            {expense.link && (
                              <a
                                href={expense.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pictus-lime hover:underline truncate max-w-xs"
                              >
                                {expense.link}
                              </a>
                            )}
                          </div>
                        )}
                      </>
                    )}
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
