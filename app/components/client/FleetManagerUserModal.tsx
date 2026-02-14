'use client'
import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  organization: string | null
  active: boolean
  isFleetManager: boolean
  role: string
}

interface FleetManagerUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: User | null
  organization: string // This will be the organization name for display
  organizationId?: string // Optional: UUID of the organization
}

export default function FleetManagerUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  organization,
  organizationId,
}: FleetManagerUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    active: true,
    isFleetManager: false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        password: '',
        active: user.active ?? true,
        isFleetManager: user.isFleetManager || false,
      })
    } else {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: '',
        active: true,
        isFleetManager: false,
      })
    }
    setError('')
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.firstName || !formData.lastName) {
      setError('Email, meno a priezvisko sú povinné')
      return
    }

    setSaving(true)

    try {
      const url = user ? `/api/users/${user.id}` : '/api/users'
      const method = user ? 'PUT' : 'POST'

      const body: any = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || null,
        active: formData.active,
        isFleetManager: formData.isFleetManager,
        loginProvider: 'hybrid',
      }

      // Only include organization for new users
      if (!user) {
        // Send organizationId if available, otherwise fall back to organization name
        if (organizationId) {
          body.organizationId = organizationId
          body.organization = organizationId // Also set organization field for backward compatibility
        } else {
          body.organization = organization
        }
      }

      // Include password if provided
      if (formData.password && formData.password.trim() !== '') {
        body.password = formData.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save user')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Failed to save user:', err)
      setError(err.message || 'Nepodarilo sa uložiť používateľa')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-pictus-onyx900 border border-pictus-lime/30 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            {user ? 'Upraviť používateľa' : 'Pridať nového používateľa'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organizácia
            </label>
            <input
              type="text"
              value={organization}
              disabled
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meno <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priezvisko <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Telefónne číslo
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {user ? 'Heslo (nechajte prázdne pre ponechanie aktuálneho)' : 'Heslo (nechajte prázdne pre predvolené)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
              placeholder={user ? 'Nové heslo...' : 'Predvolené heslo bude použité'}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-pictus-lime focus:ring-pictus-lime"
              />
              <span className="text-sm text-gray-300">Aktívny</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFleetManager}
                onChange={(e) => setFormData({ ...formData, isFleetManager: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-pictus-lime focus:ring-pictus-lime"
              />
              <span className="text-sm text-gray-300">Správca flotily</span>
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg transition-all"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 disabled:opacity-50 text-pictus-black rounded-lg transition-all"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Ukladám...' : user ? 'Uložiť' : 'Vytvoriť'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
