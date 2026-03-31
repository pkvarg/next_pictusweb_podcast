'use client'
import React, { useState, useEffect } from 'react'
import { X, User, Mail, Building, ToggleLeft, Lock, Shield, Phone } from 'lucide-react'

interface Organization {
  id: string
  name: string
}

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  organization: string | null
  organizationId: string | null
  organizationRelation?: {
    id: string
    name: string
  }
  active: boolean
  isFleetManager: boolean
  password: string | null
  loginProvider: string | null

}

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onUserUpdated: () => void
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    organizationId: '',
    active: true,
    isFleetManager: false,
    password: '',
    loginProvider: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [organizations, setOrganizations] = useState<Organization[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchOrganizations()
    }
  }, [isOpen])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    }
  }

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        organizationId: user.organizationId || '',
        active: user.active,
        isFleetManager: user.isFleetManager || false,
        password: '', // Never load existing password (security + prevents double-hashing)
        loginProvider: user.loginProvider || '',
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onUserUpdated()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update user')
      }
    } catch (error) {
      setError('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = 'checked' in e.target ? e.target.checked : false
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="+421..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Building className="h-4 w-4 inline mr-2" />
              Organization
            </label>
            <select
              name="organizationId"
              value={formData.organizationId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select organization...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="h-4 w-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Leave empty to keep current"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Shield className="h-4 w-4 inline mr-2" />
                Login Provider
              </label>
              <select
                name="loginProvider"
                value={formData.loginProvider}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">None</option>
                <option value="google">Google</option>
                <option value="github">GitHub</option>
                {/* <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option> */}
                <option value="credentials">Credentials</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <ToggleLeft className="h-4 w-4 mr-2" />
              Active Status
            </label>
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-4 h-4 text-pictus-lime bg-gray-100 border-gray-300 rounded focus:ring-pictus-lime"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm font-medium text-gray-300">
              <Shield className="h-4 w-4 mr-2" />
              Fleet Manager
            </label>
            <input
              type="checkbox"
              name="isFleetManager"
              checked={formData.isFleetManager}
              onChange={handleChange}
              className="w-4 h-4 text-pictus-lime bg-gray-100 border-gray-300 rounded focus:ring-pictus-lime"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white text-[14px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black text-[14px] rounded-lg font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all shadow-lg hover:shadow-pictus-lime/50 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
