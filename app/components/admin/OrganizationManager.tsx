'use client'

import { useState, useEffect } from 'react'
import { Building, Plus, Edit2, Trash2, Save, X, Users, Gift } from 'lucide-react'

interface TierInfo {
  id: string
  name: string
  usersLimit: number
  vehiclesLimit: number
  notificationsLimit: number
  templatesLimit: number
  notificationTypesLimit: number
  pricePerVehicle?: number | null
}

interface Organization {
  id: string
  name: string
  mainContact: string | null
  tierId: string | null
  tierRelation?: TierInfo
  currentUsersCount: number
  currentVehiclesCount: number
  currentNotificationsCount: number
  currentTemplatesCount: number
  currentNotificationTypesCount: number
  usersLimit: number | null
  vehiclesLimit: number | null
  notificationsLimit: number | null
  templatesLimit: number | null
  notificationTypesLimit: number | null
  purchasedVehicles: number | null
  hiddenFromPictusaci: boolean
  canCreateBenefit: boolean
  freeTrialEndDate: string | null
  freeTrialTierId: string | null
  stripeSubscriptionStatus: string | null
  isBenefitOrg: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  parentOrganizationId: string | null
  parentOrganization?: {
    id: string
    name: string
  }
  childOrganizations?: {
    id: string
    name: string
  }[]
}

export default function OrganizationManager() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [tiers, setTiers] = useState<TierInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [newItem, setNewItem] = useState<any>(null)

  useEffect(() => {
    fetchOrganizations()
    fetchTiers()
  }, [])

  const fetchTiers = async () => {
    try {
      const response = await fetch('/api/tiers')
      if (response.ok) {
        const data = await response.json()
        setTiers(data.tiers || [])
      }
    } catch (error) {
      console.error('Failed to fetch tiers:', error)
    }
  }

  const fetchOrganizations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setNewItem({ name: '', mainContact: '', parentOrganizationId: '', tierId: '' })
  }

  const handleSaveNew = async () => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          mainContact: newItem.mainContact || null,
          parentOrganizationId: newItem.parentOrganizationId || null,
          tierId: newItem.tierId || null,
        }),
      })

      if (response.ok) {
        setNewItem(null)
        fetchOrganizations()
      } else {
        alert('Failed to create organization')
      }
    } catch (error) {
      console.error('Failed to create organization:', error)
      alert('Error creating organization')
    }
  }

  const handleEdit = (organization: Organization) => {
    setEditingItem({
      id: organization.id,
      name: organization.name,
      mainContact: organization.mainContact || '',
      parentOrganizationId: organization.parentOrganizationId || '',
      tierId: organization.tierId || '',
      usersLimit: organization.usersLimit ?? '',
      vehiclesLimit: organization.vehiclesLimit ?? '',
      notificationsLimit: organization.notificationsLimit ?? '',
      templatesLimit: organization.templatesLimit ?? '',
      notificationTypesLimit: organization.notificationTypesLimit ?? '',
      purchasedVehicles: organization.purchasedVehicles ?? '',
      hiddenFromPictusaci: organization.hiddenFromPictusaci || false,
      canCreateBenefit: organization.canCreateBenefit || false,
      freeTrialEndDate: organization.freeTrialEndDate ? organization.freeTrialEndDate.split('T')[0] : '',
      freeTrialTierId: organization.freeTrialTierId || '',
    })
  }

  const handleSaveEdit = async () => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          name: editingItem.name,
          mainContact: editingItem.mainContact || null,
          parentOrganizationId: editingItem.parentOrganizationId || null,
          tierId: editingItem.tierId || null,
          usersLimit: editingItem.usersLimit === '' ? null : editingItem.usersLimit,
          vehiclesLimit: editingItem.vehiclesLimit === '' ? null : editingItem.vehiclesLimit,
          notificationsLimit: editingItem.notificationsLimit === '' ? null : editingItem.notificationsLimit,
          templatesLimit: editingItem.templatesLimit === '' ? null : editingItem.templatesLimit,
          notificationTypesLimit: editingItem.notificationTypesLimit === '' ? null : editingItem.notificationTypesLimit,
          purchasedVehicles: editingItem.purchasedVehicles === '' ? null : editingItem.purchasedVehicles,
          hiddenFromPictusaci: editingItem.hiddenFromPictusaci,
          canCreateBenefit: editingItem.canCreateBenefit,
          freeTrialEndDate: editingItem.freeTrialEndDate || null,
          freeTrialTierId: editingItem.freeTrialTierId || null,
        }),
      })

      if (response.ok) {
        setEditingItem(null)
        fetchOrganizations()
      } else {
        alert('Failed to update organization')
      }
    } catch (error) {
      console.error('Failed to update organization:', error)
      alert('Error updating organization')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return

    try {
      const response = await fetch(`/api/organizations?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchOrganizations()
      } else {
        alert('Failed to delete organization')
      }
    } catch (error) {
      console.error('Failed to delete organization:', error)
      alert('Error deleting organization')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-xl">
            <Building className="w-6 h-6 text-pictus-black" />
          </div>
          <div>
            <h2 className="text-3xl font-light text-pictus-white">Organizations</h2>
            <p className="text-gray-400 text-lg">Manage all organizations in the system</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-pictus-black rounded-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Organization
        </button>
      </div>

      {/* Content */}
      <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl p-6 border border-pictus-lime/30">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pictus-lime mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* New Item Form */}
            {newItem && (
              <div className="bg-white/5 rounded-lg p-4 border border-pictus-lime">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Organization Name *"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder="Main Contact"
                    value={newItem.mainContact}
                    onChange={(e) => setNewItem({ ...newItem, mainContact: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                  <select
                    value={newItem.tierId}
                    onChange={(e) => setNewItem({ ...newItem, tierId: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    <option value="">Select Tier</option>
                    {tiers.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name} (Users: {tier.usersLimit}, Vehicles: {tier.vehiclesLimit})
                      </option>
                    ))}
                  </select>
                  <select
                    value={newItem.parentOrganizationId}
                    onChange={(e) => setNewItem({ ...newItem, parentOrganizationId: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    <option value="">No Parent Organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleSaveNew}
                    disabled={!newItem.name}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setNewItem(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Organizations List */}
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-pictus-lime/30 transition-all"
              >
                {editingItem?.id === org.id ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={editingItem.mainContact}
                        onChange={(e) => setEditingItem({ ...editingItem, mainContact: e.target.value })}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        placeholder="Main Contact"
                      />
                      <select
                        value={editingItem.tierId}
                        onChange={(e) => setEditingItem({ ...editingItem, tierId: e.target.value })}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      >
                        <option value="">Select Tier</option>
                        {tiers.map((tier) => (
                          <option key={tier.id} value={tier.id}>
                            {tier.name} (Users: {tier.usersLimit}, Vehicles: {tier.vehiclesLimit})
                          </option>
                        ))}
                      </select>
                      <select
                        value={editingItem.parentOrganizationId}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, parentOrganizationId: e.target.value })
                        }
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      >
                        <option value="">No Parent Organization</option>
                        {organizations
                          .filter((o) => o.id !== org.id)
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    {/* Limit overrides row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-3">
                      <div>
                        <label className="text-xs text-gray-400">Users Limit</label>
                        <input
                          type="number"
                          value={editingItem.usersLimit}
                          onChange={(e) => setEditingItem({ ...editingItem, usersLimit: e.target.value })}
                          placeholder={org.tierRelation?.usersLimit?.toString() || '—'}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Vehicles Limit</label>
                        <input
                          type="number"
                          value={editingItem.vehiclesLimit}
                          onChange={(e) => setEditingItem({ ...editingItem, vehiclesLimit: e.target.value })}
                          placeholder={org.tierRelation?.vehiclesLimit?.toString() || '—'}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Notifications</label>
                        <input
                          type="number"
                          value={editingItem.notificationsLimit}
                          onChange={(e) => setEditingItem({ ...editingItem, notificationsLimit: e.target.value })}
                          placeholder={org.tierRelation?.notificationsLimit?.toString() || '—'}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Templates</label>
                        <input
                          type="number"
                          value={editingItem.templatesLimit}
                          onChange={(e) => setEditingItem({ ...editingItem, templatesLimit: e.target.value })}
                          placeholder={org.tierRelation?.templatesLimit?.toString() || '—'}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Notif. Types</label>
                        <input
                          type="number"
                          value={editingItem.notificationTypesLimit}
                          onChange={(e) => setEditingItem({ ...editingItem, notificationTypesLimit: e.target.value })}
                          placeholder={org.tierRelation?.notificationTypesLimit?.toString() || '—'}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Purchased Veh.</label>
                        <input
                          type="number"
                          value={editingItem.purchasedVehicles}
                          onChange={(e) => setEditingItem({ ...editingItem, purchasedVehicles: e.target.value })}
                          placeholder="—"
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                    {/* Free trial fields */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                      <div>
                        <label className="text-xs text-gray-400">Free Period Ends</label>
                        <input
                          type="date"
                          value={editingItem.freeTrialEndDate}
                          onChange={(e) => setEditingItem({ ...editingItem, freeTrialEndDate: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Gifted Tier</label>
                        <select
                          value={editingItem.freeTrialTierId}
                          onChange={(e) => setEditingItem({ ...editingItem, freeTrialTierId: e.target.value })}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        >
                          <option value="">None</option>
                          {tiers.filter(t => t.name !== 'FREE').map((tier) => (
                            <option key={tier.id} value={tier.id}>
                              {tier.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {editingItem.freeTrialEndDate && editingItem.freeTrialTierId && (
                        <div className="flex items-end">
                          <span className="text-xs text-amber-300 bg-amber-500/10 px-2 py-1.5 rounded-lg">
                            Free {tiers.find(t => t.id === editingItem.freeTrialTierId)?.name || '?'} until {editingItem.freeTrialEndDate}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Toggles row */}
                    <div className="flex items-center gap-6 mt-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`hidden-${org.id}`}
                          checked={editingItem.hiddenFromPictusaci}
                          onChange={(e) => setEditingItem({ ...editingItem, hiddenFromPictusaci: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <label htmlFor={`hidden-${org.id}`} className="text-sm text-gray-300">
                          Hidden from PICTUSACI
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`benefit-${org.id}`}
                          checked={editingItem.canCreateBenefit}
                          onChange={(e) => setEditingItem({ ...editingItem, canCreateBenefit: e.target.checked })}
                          className="w-4 h-4 rounded"
                        />
                        <label htmlFor={`benefit-${org.id}`} className="text-sm text-gray-300">
                          <Gift className="w-3 h-3 inline mr-1" />
                          Can Create Benefit
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white text-xl font-light">{org.name}</p>
                        {org.tierRelation && (
                          <span className={`px-2 py-1 text-xs rounded font-medium ${
                            org.tierRelation.name === 'FREE' ? 'bg-gray-500/20 text-gray-300' :
                            org.tierRelation.name === 'BASIC' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-purple-500/20 text-purple-300'
                          }`}>
                            {org.tierRelation.name}
                          </span>
                        )}
                        {org.canCreateBenefit && (
                          <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded font-medium">
                            <Gift className="w-3 h-3 inline mr-1" />
                            Benefit
                          </span>
                        )}
                        {org.isBenefitOrg && (
                          <span className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded font-medium">
                            <Gift className="w-3 h-3 inline mr-1" />
                            Sub-org
                          </span>
                        )}
                        {org.hiddenFromPictusaci && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded font-medium">
                            Hidden
                          </span>
                        )}
                        {org.freeTrialEndDate && org.freeTrialTierId && (
                          new Date(org.freeTrialEndDate) < new Date() && !org.stripeSubscriptionStatus ? (
                            <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded font-medium">
                              Expired
                            </span>
                          ) : new Date(org.freeTrialEndDate) >= new Date() ? (
                            <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded font-medium">
                              Free until {new Date(org.freeTrialEndDate).toLocaleDateString()}
                            </span>
                          ) : null
                        )}
                        {org.childOrganizations && org.childOrganizations.length > 0 && (
                          <span className="px-2 py-1 bg-pictus-lime/20 text-pictus-lime text-xs rounded">
                            <Users className="w-3 h-3 inline mr-1" />
                            {org.childOrganizations.length} sub-org{org.childOrganizations.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        {org.mainContact && (
                          <p className="text-gray-400 text-sm">Contact: {org.mainContact}</p>
                        )}
                        {org.parentOrganization && (
                          <p className="text-gray-400 text-sm">
                            Parent: {org.parentOrganization.name}
                          </p>
                        )}
                        <p className="text-gray-400 text-sm">
                          Created: {new Date(org.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {(org.tierRelation || org.usersLimit !== null) && (
                        <div className="flex gap-4 mt-2 text-xs flex-wrap">
                          <span className="text-gray-400">
                            Users: <span className="text-pictus-lime">{org.currentUsersCount}</span>/{org.usersLimit ?? org.tierRelation?.usersLimit ?? '—'}
                          </span>
                          <span className="text-gray-400">
                            Vehicles: <span className="text-pictus-lime">{org.currentVehiclesCount}</span>/{org.vehiclesLimit ?? org.tierRelation?.vehiclesLimit ?? '—'}
                          </span>
                          <span className="text-gray-400">
                            Notifications: <span className="text-pictus-lime">{org.currentNotificationsCount}</span>/{org.notificationsLimit ?? org.tierRelation?.notificationsLimit ?? '—'}
                          </span>
                          <span className="text-gray-400">
                            Templates: <span className="text-pictus-lime">{org.currentTemplatesCount}</span>/{org.templatesLimit ?? org.tierRelation?.templatesLimit ?? '—'}
                          </span>
                          {org.purchasedVehicles != null && (
                            <span className="text-gray-400">
                              Purchased: <span className="text-pictus-lime">{org.purchasedVehicles}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(org)}
                        className="p-2.5 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4 text-pictus-lime" />
                      </button>
                      <button
                        onClick={() => handleDelete(org.id)}
                        className="p-2.5 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {organizations.length === 0 && (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-light text-pictus-white mb-2">No Organizations</h3>
                <p className="text-gray-400">Click &quot;Add Organization&quot; to create your first organization</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
