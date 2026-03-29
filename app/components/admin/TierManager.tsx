'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Edit2, Save, X, Loader2 } from 'lucide-react'

interface Tier {
  id: string
  name: string
  pricePerVehicle: number | null
  pricePerVehicleYearly: number | null
  yearlyDiscount: number | null
  stripePriceMonthly: string | null
  stripePriceYearly: string | null
  usersLimit: number
  vehiclesLimit: number
  notificationsLimit: number
  templatesLimit: number
  notificationTypesLimit: number
}

export default function TierManager() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Tier>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    try {
      const res = await fetch('/api/tiers')
      const data = await res.json()
      if (data.tiers) setTiers(data.tiers)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load tiers' })
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (tier: Tier) => {
    setEditingId(tier.id)
    setEditForm({
      pricePerVehicle: tier.pricePerVehicle,
      pricePerVehicleYearly: tier.pricePerVehicleYearly,
      yearlyDiscount: tier.yearlyDiscount,
      stripePriceMonthly: tier.stripePriceMonthly,
      stripePriceYearly: tier.stripePriceYearly,
    })
    setMessage(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSave = async () => {
    if (!editingId) return
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          pricePerVehicle: editForm.pricePerVehicle,
          pricePerVehicleYearly: editForm.pricePerVehicleYearly,
          yearlyDiscount: editForm.yearlyDiscount,
          stripePriceMonthly: editForm.stripePriceMonthly,
          stripePriceYearly: editForm.stripePriceYearly,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Tier updated successfully' })
        setEditingId(null)
        setEditForm({})
        await fetchTiers()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Failed to update tier' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update tier' })
    } finally {
      setSaving(false)
    }
  }

  const tierColor = (name: string) => {
    switch (name) {
      case 'FREE': return 'border-gray-500/30 bg-gray-500/5'
      case 'BASIC': return 'border-purple-500/30 bg-purple-500/5'
      case 'BUSINESS': return 'border-pictus-lime/30 bg-pictus-lime/5'
      default: return 'border-white/10 bg-white/5'
    }
  }

  const tierBadgeColor = (name: string) => {
    switch (name) {
      case 'FREE': return 'bg-gray-600 text-gray-100'
      case 'BASIC': return 'bg-purple-600 text-purple-100'
      case 'BUSINESS': return 'bg-pictus-lime/80 text-pictus-black'
      default: return 'bg-white/20 text-white'
    }
  }

  const inputClass =
    'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent text-sm'
  const labelClass = 'block text-xs font-light text-gray-400 mb-1'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-pictus-lime" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <DollarSign className="w-6 h-6 text-pictus-lime" />
        <h2 className="text-2xl font-light text-white">Tiers & Pricing</h2>
      </div>

      <p className="text-gray-400 font-light text-sm">
        Manage pricing per vehicle, yearly discount, and Stripe price IDs for each tier. Changes here are reflected on the public pricing page.
      </p>

      {/* Messages */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg text-sm font-light ${
            message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-200'
              : 'bg-red-500/20 border border-red-500/30 text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tier Cards */}
      <div className="grid gap-6">
        {tiers.map((tier) => {
          const isEditing = editingId === tier.id

          return (
            <div
              key={tier.id}
              className={`rounded-xl p-6 border transition-all ${tierColor(tier.name)}`}
            >
              {/* Tier Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${tierBadgeColor(tier.name)}`}>
                    {tier.name}
                  </span>
                  <span className="text-gray-400 text-sm font-light">
                    Limits: {tier.usersLimit} users, {tier.vehiclesLimit} vehicles, {tier.notificationsLimit} notifications
                  </span>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => startEdit(tier)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-light text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-3 py-1.5 bg-pictus-lime/20 hover:bg-pictus-lime/30 border border-pictus-lime/30 rounded-lg text-sm font-light text-pictus-lime transition-colors disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-light text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Display Mode */}
              {!isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Price / vehicle / month</div>
                    <div className="text-lg font-light text-white">
                      €{tier.pricePerVehicle != null ? Number(tier.pricePerVehicle) : '–'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Yearly price / vehicle</div>
                    <div className="text-lg font-light text-white">
                      {tier.pricePerVehicleYearly != null ? `€${Number(tier.pricePerVehicleYearly)}` : '–'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Yearly discount</div>
                    <div className="text-lg font-light text-white">
                      {tier.yearlyDiscount != null ? `${((1 - Number(tier.yearlyDiscount)) * 100).toFixed(0)}% (×${Number(tier.yearlyDiscount)})` : '–'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Stripe Monthly ID</div>
                    <div className="text-sm font-mono text-gray-300 truncate">
                      {tier.stripePriceMonthly || <span className="text-gray-600 italic">not set</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Stripe Yearly ID</div>
                    <div className="text-sm font-mono text-gray-300 truncate">
                      {tier.stripePriceYearly || <span className="text-gray-600 italic">not set</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Mode */}
              {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Price per vehicle / month (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={inputClass}
                      value={editForm.pricePerVehicle ?? ''}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, pricePerVehicle: e.target.value ? parseFloat(e.target.value) : null }))
                      }
                      placeholder="e.g. 2.00"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Yearly price/vehicle (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={inputClass}
                      value={editForm.pricePerVehicleYearly ?? ''}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, pricePerVehicleYearly: e.target.value ? parseFloat(e.target.value) : null }))
                      }
                      placeholder="e.g. 29.88"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Yearly discount multiplier (e.g. 0.83 = 17% off)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      className={inputClass}
                      value={editForm.yearlyDiscount ?? ''}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, yearlyDiscount: e.target.value ? parseFloat(e.target.value) : null }))
                      }
                      placeholder="e.g. 0.83"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Stripe Price ID — Monthly</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={editForm.stripePriceMonthly ?? ''}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, stripePriceMonthly: e.target.value }))
                      }
                      placeholder="price_..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Stripe Price ID — Yearly</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={editForm.stripePriceYearly ?? ''}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, stripePriceYearly: e.target.value }))
                      }
                      placeholder="price_..."
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
