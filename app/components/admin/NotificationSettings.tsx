'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Bell,
  MessageSquare,
  Sparkles,
  Building,
} from 'lucide-react'

interface TypeOption {
  id: string
  label: string
  sortOrder: number
  isActive: boolean
}

interface ChannelOption {
  id: string
  label: string
  sortOrder: number
  isActive: boolean
}

interface Template {
  id: string
  name: string
  notificationType: string
  notificationChannel: string
  daysBeforeDuty: number | null // Deprecated: use reminderIntervals
  reminderIntervals: number[] | null // Array of day offsets: e.g., [-30, -14, -7, 0, 1, 2]
  emailMessage: string | null
  smsMessage: string | null
  isActive: boolean
}

interface NotificationSettingsProps {
  organization?: string
  initialTab?: 'types' | 'channels' | 'templates'
  hideTabs?: boolean
  hideOrganizationSelector?: boolean
}

interface Organization {
  id: string
  name: string
}

export default function NotificationSettings({
  organization: initialOrganization,
  initialTab = 'types',
  hideTabs = false,
  hideOrganizationSelector = false,
}: NotificationSettingsProps) {
  const [activeTab, setActiveTab] = useState<'types' | 'channels' | 'templates'>(initialTab)
  const [typeOptions, setTypeOptions] = useState<TypeOption[]>([])
  const [channelOptions, setChannelOptions] = useState<ChannelOption[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [newItem, setNewItem] = useState<any>(null)
  const [organization, setOrganization] = useState(initialOrganization || '')
  const [usingDefaultTypeOptions, setUsingDefaultTypeOptions] = useState(false)
  const [usingDefaultChannelOptions, setUsingDefaultChannelOptions] = useState(false)

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

  const fetchTypeOptions = useCallback(async () => {
    if (!organization) return

    try {
      // Try to fetch options for the current organization
      const response = await fetch(`/api/notification-type-options?organization=${organization}`)
      if (response.ok) {
        const data = await response.json()
        const options = data.options || []

        // If no options found for current organization, fetch from DEFAULT
        if (options.length === 0 && organization !== 'DEFAULT') {
          const defaultResponse = await fetch(`/api/notification-type-options?organization=DEFAULT`)
          if (defaultResponse.ok) {
            const defaultData = await defaultResponse.json()
            setTypeOptions(defaultData.options || [])
            setUsingDefaultTypeOptions(true)
            return
          }
        }

        setTypeOptions(options)
        setUsingDefaultTypeOptions(false)
      }
    } catch (error) {
      console.error('Failed to fetch type options:', error)
    }
  }, [organization])

  const fetchChannelOptions = useCallback(async () => {
    if (!organization) return

    try {
      // Try to fetch options for the current organization
      const response = await fetch(`/api/notification-channel-options?organization=${organization}`)
      if (response.ok) {
        const data = await response.json()
        const options = data.options || []

        // If no options found for current organization, fetch from DEFAULT
        if (options.length === 0 && organization !== 'DEFAULT') {
          const defaultResponse = await fetch(`/api/notification-channel-options?organization=DEFAULT`)
          if (defaultResponse.ok) {
            const defaultData = await defaultResponse.json()
            setChannelOptions(defaultData.options || [])
            setUsingDefaultChannelOptions(true)
            return
          }
        }

        setChannelOptions(options)
        setUsingDefaultChannelOptions(false)
      }
    } catch (error) {
      console.error('Failed to fetch channel options:', error)
    }
  }, [organization])

  const fetchData = useCallback(async () => {
    if (!organization) return

    setLoading(true)
    try {
      if (activeTab === 'types') {
        await fetchTypeOptions()
      } else if (activeTab === 'channels') {
        await fetchChannelOptions()
      } else if (activeTab === 'templates') {
        const response = await fetch(`/api/notification-templates?organization=${organization}`)
        if (response.ok) {
          const data = await response.json()
          setTemplates(data.templates || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [organization, activeTab, fetchTypeOptions, fetchChannelOptions])

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (organization) {
      fetchData()
      // Always fetch type and channel options when organization changes
      // This ensures they're available for template creation
      if (activeTab !== 'types') {
        fetchTypeOptions()
      }
      if (activeTab !== 'channels') {
        fetchChannelOptions()
      }
    }
  }, [organization, activeTab, fetchData, fetchTypeOptions, fetchChannelOptions])

  const handleAddNew = () => {
    if (activeTab === 'types') {
      setNewItem({ label: '', sortOrder: typeOptions.length })
    } else if (activeTab === 'channels') {
      setNewItem({ label: '', sortOrder: channelOptions.length })
    } else if (activeTab === 'templates') {
      setNewItem({
        name: '',
        notificationType: '',
        notificationChannel: '',
        daysBeforeDuty: null,
        reminderIntervals: [-7], // Default: 7 days before
        emailMessage: '',
        smsMessage: '',
      })
    }
  }

  const handleSaveNew = async () => {
    // Validate organization is selected
    if (!organization || organization === '') {
      alert('Please select an organization first')
      return
    }

    try {
      let endpoint = ''
      let data = { ...newItem, organization }

      if (activeTab === 'types') {
        endpoint = '/api/notification-type-options'
      } else if (activeTab === 'channels') {
        endpoint = '/api/notification-channel-options'
      } else if (activeTab === 'templates') {
        endpoint = '/api/notification-templates'
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setNewItem(null)
        fetchData()
        alert('Item created successfully!')
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(`Failed to create item: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error('Failed to create item:', error)
      alert('Error creating item')
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem({ ...item })
  }

  const handleSaveEdit = async () => {
    try {
      let endpoint = ''

      if (activeTab === 'types') {
        endpoint = '/api/notification-type-options'
      } else if (activeTab === 'channels') {
        endpoint = '/api/notification-channel-options'
      } else if (activeTab === 'templates') {
        endpoint = '/api/notification-templates'
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      })

      if (response.ok) {
        setEditingItem(null)
        fetchData()
      } else {
        alert('Failed to update item')
      }
    } catch (error) {
      console.error('Failed to update item:', error)
      alert('Error updating item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      let endpoint = ''

      if (activeTab === 'types') {
        endpoint = `/api/notification-type-options?id=${id}`
      } else if (activeTab === 'channels') {
        endpoint = `/api/notification-channel-options?id=${id}`
      } else if (activeTab === 'templates') {
        endpoint = `/api/notification-templates?id=${id}`
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchData()
      } else {
        alert('Failed to delete item')
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Error deleting item')
    }
  }

  return (
    <div className="space-y-6">
      {/* Organization Dropdown */}
      {!hideOrganizationSelector && (
        <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl p-6 border border-pictus-lime/30">
          <label className="block text-pictus-lime text-sm mb-2">
            <Building className="w-4 h-4 inline mr-1" />
            Organizácia *
          </label>
          <select
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
          >
            <option value="">Vyberte organizáciu...</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.name}>
                {org.name}
              </option>
            ))}
          </select>
          <p className="text-gray-400 text-sm mt-2">
            Vyberte organizáciu pre nastavenie notifikácií. Použije sa pre typy notifikácií, kanály
            a šablóny.
          </p>
        </div>
      )}

      {!organization ? (
        <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl p-12 border border-pictus-lime/30 text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-light text-pictus-white mb-2">
            Žiadna organizácia nebola vybraná
          </h3>
          <p className="text-gray-400">
            Prosím vyberte organizáciu vyššie pre nastavenie notifikácií.
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          {!hideTabs && (
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-xl">
                <Settings className="w-6 h-6 text-pictus-black" />
              </div>
              <div>
                <h2 className="text-3xl font-light text-pictus-white">Nastavenia notifikácií</h2>
                <p className="text-gray-400 text-lg">Nastaviť notifikácie pre {organization}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          {!hideTabs && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('types')}
                className={`px-6 py-3 rounded-lg text-xl font-light transition-all ${
                  activeTab === 'types'
                    ? 'bg-pictus-lime text-pictus-black'
                    : 'bg-gray-700 text-pictus-white hover:bg-gray-600'
                }`}
              >
                <Bell className="w-5 h-5 inline mr-2" />
                Typy notifikácií
              </button>
              <button
                onClick={() => setActiveTab('channels')}
                className={`px-6 py-3 rounded-lg text-xl font-light transition-all ${
                  activeTab === 'channels'
                    ? 'bg-pictus-lime text-pictus-black'
                    : 'bg-gray-700 text-pictus-white hover:bg-gray-600'
                }`}
              >
                <MessageSquare className="w-5 h-5 inline mr-2" />
                Kanály
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-3 rounded-lg text-xl font-light transition-all ${
                  activeTab === 'templates'
                    ? 'bg-pictus-lime text-pictus-black'
                    : 'bg-gray-700 text-pictus-white hover:bg-gray-600'
                }`}
              >
                <Sparkles className="w-5 h-5 inline mr-2" />
                Šablóny
              </button>
            </div>
          )}

          {/* Content */}
          <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl p-6 border border-pictus-lime/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-light text-pictus-white">
                {activeTab === 'types' && 'Typy notifikácií'}
                {activeTab === 'channels' && 'Kanály notifikácií'}
                {activeTab === 'templates' && 'Šablóny notifikácií'}
              </h3>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-pictus-black rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Pridať
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pictus-lime mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* New Item Form */}
                {newItem && (
                  <div className="bg-white/5 rounded-lg p-4 border border-pictus-lime">
                    {!organization && (
                      <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-200 text-sm">
                        ⚠️ Prosím vyberte organizáciu pred vytvorením položky
                      </div>
                    )}
                    {(activeTab === 'types' || activeTab === 'channels') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-pictus-lime text-xs mb-1">Názov *</label>
                          <input
                            type="text"
                            placeholder="napr., Email, SMS.."
                            value={newItem.label}
                            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                          />
                          <p className="text-gray-500 text-xs mt-1">
                            Zobrazovaný názov pre túto možnosť
                          </p>
                        </div>
                        <div>
                          <label className="block text-pictus-lime text-xs mb-1">Poradie</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={newItem.sortOrder}
                            onChange={(e) =>
                              setNewItem({ ...newItem, sortOrder: parseInt(e.target.value) })
                            }
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                          />
                          <p className="text-gray-500 text-xs mt-1">Poradie v zozname (0 = prvý)</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'templates' && (
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Názov šablóny *"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                        />
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <select
                              value={newItem.notificationType}
                              onChange={(e) =>
                                setNewItem({ ...newItem, notificationType: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                            >
                              <option value="">Vybrať typ notifikácie *</option>
                              {typeOptions.map((option) => (
                                <option key={option.id} value={option.label}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {usingDefaultTypeOptions && (
                              <p className="text-yellow-400 text-xs mt-1">
                                Používajú sa predvolené možnosti (z DEFAULT)
                              </p>
                            )}
                          </div>
                          <div>
                            <select
                              value={newItem.notificationChannel}
                              onChange={(e) =>
                                setNewItem({ ...newItem, notificationChannel: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                            >
                              <option value="">Vybrať kanál *</option>
                              {channelOptions.map((option) => (
                                <option key={option.id} value={option.label}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            {usingDefaultChannelOptions && (
                              <p className="text-yellow-400 text-xs mt-1">
                                Používajú sa predvolené možnosti (z DEFAULT)
                              </p>
                            )}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-2">
                              Intervaly pripomienok (dni relatívne k termínu)
                            </label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="text"
                                placeholder="napr: -30,-14,-7,0,1,2"
                                value={newItem.reminderIntervalsInput !== undefined ? newItem.reminderIntervalsInput : (newItem.reminderIntervals?.join(',') || '')}
                                onChange={(e) => {
                                  const value = e.target.value
                                  // Store the raw input value
                                  setNewItem({ ...newItem, reminderIntervalsInput: value })
                                }}
                                onBlur={(e) => {
                                  // Parse the intervals when user is done editing (on blur)
                                  const value = e.target.value.trim()
                                  if (value === '') {
                                    setNewItem({ ...newItem, reminderIntervals: [], reminderIntervalsInput: undefined })
                                  } else {
                                    const intervals = value.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n))
                                    setNewItem({ ...newItem, reminderIntervals: intervals, reminderIntervalsInput: undefined })
                                  }
                                }}
                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                              />
                              <span className="text-xs text-gray-400">
                                {newItem.reminderIntervals?.length || 0} intervalov
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Záporné = pred termínom, 0 = v deň, kladné = po termíne
                            </p>
                          </div>
                        </div>
                        <textarea
                          placeholder="Emailová správa"
                          value={newItem.emailMessage}
                          onChange={(e) => setNewItem({ ...newItem, emailMessage: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleSaveNew}
                        disabled={
                          !organization ||
                          (activeTab === 'types' && !newItem.label) ||
                          (activeTab === 'channels' && !newItem.label) ||
                          (activeTab === 'templates' &&
                            (!newItem.name ||
                              !newItem.notificationType ||
                              !newItem.notificationChannel))
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                      >
                        <Save className="w-4 h-4" />
                        Uložiť
                      </button>
                      <button
                        onClick={() => setNewItem(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                        Zrušiť
                      </button>
                    </div>
                  </div>
                )}

                {/* Type Options List */}
                {activeTab === 'types' &&
                  typeOptions.map((option) => (
                    <div
                      key={option.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-pictus-lime/30 transition-all"
                    >
                      {editingItem?.id === option.id ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-pictus-lime text-xs mb-1">Názov</label>
                              <input
                                type="text"
                                value={editingItem.label}
                                onChange={(e) =>
                                  setEditingItem({ ...editingItem, label: e.target.value })
                                }
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-pictus-lime text-xs mb-1">Poradie</label>
                              <input
                                type="number"
                                value={editingItem.sortOrder}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    sortOrder: parseInt(e.target.value),
                                  })
                                }
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                              />
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
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-lg font-light">{option.label}</p>
                            <p className="text-gray-400 text-sm">Poradie: {option.sortOrder}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(option)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4 text-pictus-lime" />
                            </button>
                            <button
                              onClick={() => handleDelete(option.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {/* Channel Options List */}
                {activeTab === 'channels' &&
                  channelOptions.map((option) => (
                    <div
                      key={option.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-pictus-lime/30 transition-all"
                    >
                      {editingItem?.id === option.id ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-pictus-lime text-xs mb-1">Názov</label>
                              <input
                                type="text"
                                value={editingItem.label}
                                onChange={(e) =>
                                  setEditingItem({ ...editingItem, label: e.target.value })
                                }
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-pictus-lime text-xs mb-1">Poradie</label>
                              <input
                                type="number"
                                value={editingItem.sortOrder}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    sortOrder: parseInt(e.target.value),
                                  })
                                }
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                              />
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
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-lg font-light">{option.label}</p>
                            <p className="text-gray-400 text-sm">Poradie: {option.sortOrder}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(option)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4 text-pictus-lime" />
                            </button>
                            <button
                              onClick={() => handleDelete(option.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {/* Templates List */}
                {activeTab === 'templates' &&
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-pictus-lime/30 transition-all"
                    >
                      {editingItem?.id === template.id ? (
                        <>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-pictus-lime text-xs mb-1">Názov</label>
                                <input
                                  type="text"
                                  value={editingItem.name}
                                  onChange={(e) =>
                                    setEditingItem({ ...editingItem, name: e.target.value })
                                  }
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-pictus-lime text-xs mb-1">Typ notifikácie</label>
                                <select
                                  value={editingItem.notificationType}
                                  onChange={(e) =>
                                    setEditingItem({ ...editingItem, notificationType: e.target.value })
                                  }
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                                >
                                  <option value="">Vybrať typ notifikácie</option>
                                  {typeOptions.map((option) => (
                                    <option key={option.id} value={option.label}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                {usingDefaultTypeOptions && (
                                  <p className="text-yellow-400 text-xs mt-1">
                                    Používajú sa predvolené možnosti (z DEFAULT)
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-pictus-lime text-xs mb-1">Kanál</label>
                                <select
                                  value={editingItem.notificationChannel}
                                  onChange={(e) =>
                                    setEditingItem({ ...editingItem, notificationChannel: e.target.value })
                                  }
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                                >
                                  <option value="">Vybrať kanál</option>
                                  {channelOptions.map((option) => (
                                    <option key={option.id} value={option.label}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                {usingDefaultChannelOptions && (
                                  <p className="text-yellow-400 text-xs mt-1">
                                    Používajú sa predvolené možnosti (z DEFAULT)
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-pictus-lime text-xs mb-1">
                                  Intervaly pripomienok
                                </label>
                                <input
                                  type="text"
                                  placeholder="napr: -30,-14,-7,0,1,2"
                                  value={editingItem.reminderIntervalsInput !== undefined ? editingItem.reminderIntervalsInput : (editingItem.reminderIntervals?.join(',') || '')}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    // Store the raw input value
                                    setEditingItem({ ...editingItem, reminderIntervalsInput: value })
                                  }}
                                  onBlur={(e) => {
                                    // Parse the intervals when user is done editing (on blur)
                                    const value = e.target.value.trim()
                                    if (value === '') {
                                      setEditingItem({ ...editingItem, reminderIntervals: [], reminderIntervalsInput: undefined })
                                    } else {
                                      const intervals = value.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n))
                                      setEditingItem({ ...editingItem, reminderIntervals: intervals, reminderIntervalsInput: undefined })
                                    }
                                  }}
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Záporné = pred, 0 = v deň, kladné = po
                                </p>
                              </div>
                            </div>
                            <div>
                              <label className="block text-pictus-lime text-xs mb-1">Emailová správa</label>
                              <textarea
                                value={editingItem.emailMessage || ''}
                                onChange={(e) =>
                                  setEditingItem({ ...editingItem, emailMessage: e.target.value })
                                }
                                rows={3}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-pictus-lime text-xs mb-1">SMS správa</label>
                              <textarea
                                value={editingItem.smsMessage || ''}
                                onChange={(e) =>
                                  setEditingItem({ ...editingItem, smsMessage: e.target.value })
                                }
                                rows={2}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={handleSaveEdit}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                            >
                              <Save className="w-4 h-4" />
                              Uložiť
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                            >
                              <X className="w-4 h-4" />
                              Zrušiť
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-lg font-light">{template.name}</p>
                            <p className="text-gray-400 text-sm">
                              {template.notificationType} • {template.notificationChannel}
                            </p>
                            {template.reminderIntervals && template.reminderIntervals.length > 0 ? (
                              <p className="text-pictus-lime text-sm mt-1">
                                Intervaly: {template.reminderIntervals.map(i =>
                                  i === 0 ? '0' : i > 0 ? `+${i}` : `${i}`
                                ).join(', ')} dní
                              </p>
                            ) : template.daysBeforeDuty ? (
                              <p className="text-gray-400 text-sm">
                                {template.daysBeforeDuty} dní pred (zastarané)
                              </p>
                            ) : null}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(template)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4 text-pictus-lime" />
                            </button>
                            <button
                              onClick={() => handleDelete(template.id)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
