'use client'

import { useState, useEffect } from 'react'
import { Building, Plus, Edit2, Trash2, Save, X, Users } from 'lucide-react'

type Tier = 'FREE' | 'PREMIUM' | 'BUSINESS'

interface Organization {
  id: string
  name: string
  mainContact: string | null
  tier: Tier | null
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
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [newItem, setNewItem] = useState<any>(null)

  useEffect(() => {
    fetchOrganizations()
  }, [])

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
    setNewItem({ name: '', mainContact: '', parentOrganizationId: '', tier: '' })
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
          tier: newItem.tier || null,
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
      tier: organization.tier || '',
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
          tier: editingItem.tier || null,
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
      <div className="flex items-center justify-between">
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
                <div className="grid grid-cols-4 gap-4">
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
                    value={newItem.tier}
                    onChange={(e) => setNewItem({ ...newItem, tier: e.target.value })}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    <option value="">Select Tier</option>
                    <option value="FREE">Free</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="BUSINESS">Business</option>
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
                    <div className="grid grid-cols-4 gap-4">
                      <input
                        type="text"
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                      <input
                        type="text"
                        value={editingItem.mainContact}
                        onChange={(e) => setEditingItem({ ...editingItem, mainContact: e.target.value })}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                      <select
                        value={editingItem.tier}
                        onChange={(e) => setEditingItem({ ...editingItem, tier: e.target.value })}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                      >
                        <option value="">Select Tier</option>
                        <option value="FREE">Free</option>
                        <option value="PREMIUM">Premium</option>
                        <option value="BUSINESS">Business</option>
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
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-xl font-light">{org.name}</p>
                        {org.tier && (
                          <span className={`px-2 py-1 text-xs rounded font-medium ${
                            org.tier === 'FREE' ? 'bg-gray-500/20 text-gray-300' :
                            org.tier === 'PREMIUM' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-purple-500/20 text-purple-300'
                          }`}>
                            {org.tier}
                          </span>
                        )}
                        {org.childOrganizations && org.childOrganizations.length > 0 && (
                          <span className="px-2 py-1 bg-pictus-lime/20 text-pictus-lime text-xs rounded">
                            <Users className="w-3 h-3 inline mr-1" />
                            {org.childOrganizations.length} sub-org{org.childOrganizations.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1">
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
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(org)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4 text-pictus-lime" />
                      </button>
                      <button
                        onClick={() => handleDelete(org.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
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
