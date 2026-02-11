'use client'
import React, { useState, useEffect } from 'react'
import {
  Car,
  Calendar,
  Mail,
  Building,
  Phone,
  Search,
  TestTube,
  RotateCcw,
  Plus,
  Copy,
  Settings,
  Edit,
  Trash2
} from 'lucide-react'
import NotificationBuilder from './NotificationBuilder'
import NotificationSettings from './NotificationSettings'

interface Organization {
  id: string
  name: string
}

interface Vehicle {
  id: string
  organization: string
  type: string
  registration: string
  year: number | null
  image: string | null
  note: string | null
  createdAt: string
  updatedAt: string
  userId: string
  user?: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
}

interface VehicleNotification {
  id: number
  company: string | null
  personName: string | null
  email: string | null
  phoneNumber: string | null
  vehicleRegistration: string | null
  vehicleType: string | null
  notificationType: string | null
  notificationChannel: string | null
  notificationDate: string | null
  dutyDate: string | null
  emailMessage: string | null
  status: string
  emailSentAt: string | null
  smsSentAt: string | null
  createdAt: string
  sheetRowId: string | null
  confirmationAttempts: number
  confirmedAt: string | null
  lastReminderSent: string | null
  finalStatusUpdated: string | null
}

export default function AllVehicleNotifications() {
  const [notifications, setNotifications] = useState<VehicleNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotificationId, setSelectedNotificationId] = useState<string>('')
  const [testingLoading, setTestingLoading] = useState(false)
  const [showBuilder, setShowBuilder] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [duplicateData, setDuplicateData] = useState<VehicleNotification | null>(null)

  // Vehicle management state
  const [selectedOrganization, setSelectedOrganization] = useState<string>('')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(false)
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState('')

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/vehicle-notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(Array.isArray(data.notifications) ? data.notifications : [])
      }
    } catch (error) {
      console.error('Failed to fetch vehicle notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(Array.isArray(data.organizations) ? data.organizations : [])
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    }
  }

  const fetchVehicles = async (organization: string) => {
    if (!organization) return

    setVehiclesLoading(true)
    try {
      const response = await fetch(`/api/my-vehicles?organization=${encodeURIComponent(organization)}`)
      if (response.ok) {
        const data = await response.json()
        setVehicles(Array.isArray(data.vehicles) ? data.vehicles : [])
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      setVehiclesLoading(false)
    }
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

    try {
      const response = await fetch(`/api/my-vehicles/${vehicleId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchVehicles(selectedOrganization)
        alert('Vehicle deleted successfully')
      } else {
        alert('Failed to delete vehicle')
      }
    } catch (error) {
      console.error('Failed to delete vehicle:', error)
      alert('Error deleting vehicle')
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (selectedOrganization) {
      fetchVehicles(selectedOrganization)
    } else {
      setVehicles([])
    }
  }, [selectedOrganization])

  const filteredNotifications = (Array.isArray(notifications) ? notifications : []).filter(notification => {
    const searchLower = searchTerm.toLowerCase()
    return (
      notification.id.toString().includes(searchLower) ||
      (notification.email && notification.email.toLowerCase().includes(searchLower)) ||
      (notification.personName && notification.personName.toLowerCase().includes(searchLower)) ||
      (notification.company && notification.company.toLowerCase().includes(searchLower)) ||
      (notification.vehicleRegistration && notification.vehicleRegistration.toLowerCase().includes(searchLower)) ||
      notification.status.toLowerCase().includes(searchLower)
    )
  })

  const handleTestStatusUpdate = async () => {
    if (!selectedNotificationId) return

    setTestingLoading(true)
    try {
      const response = await fetch(`/api/vehicle-notifications/${selectedNotificationId}/test-update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'imported',
          clearEmailSentAt: true,
          clearSmsSentAt: true,
          clearConfirmedAt: true
        })
      })

      if (response.ok) {
        await fetchNotifications()
        setSelectedNotificationId('')
        alert('Status updated successfully!')
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Failed to update notification:', error)
      alert('Error updating status')
    } finally {
      setTestingLoading(false)
    }
  }

  const handleDuplicate = (notification: VehicleNotification) => {
    setDuplicateData(notification)
    setShowBuilder(true)
  }

  const handleDeleteNotification = async (id: number) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return
    }

    try {
      const response = await fetch(`/api/vehicle-notifications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      // Refresh the list
      fetchNotifications()
    } catch (err) {
      console.error('Error deleting notification:', err)
      alert('Failed to delete notification')
    }
  }

  const handleBuilderSuccess = () => {
    setShowBuilder(false)
    setDuplicateData(null)
    fetchNotifications()
  }

  const handleBuilderCancel = () => {
    setShowBuilder(false)
    setDuplicateData(null)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowVehicleModal(true)
  }

  const handleCreateVehicle = () => {
    setEditingVehicle(null)
    setShowVehicleModal(true)
  }

  const handleVehicleModalClose = () => {
    setShowVehicleModal(false)
    setEditingVehicle(null)
  }

  const handleVehicleModalSuccess = () => {
    setShowVehicleModal(false)
    setEditingVehicle(null)
    fetchVehicles(selectedOrganization)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'sent':
        return 'bg-pictus-lime/20 text-pictus-lime border-pictus-lime/30'
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'imported':
        return 'bg-pictus-lime/20 text-pictus-lime border-pictus-lime/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12">
        <div className="text-center">
          <div className="animate-spin mx-auto w-16 h-16 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-full flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-pictus-black" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Vehicle Notifications...</h3>
        </div>
      </div>
    )
  }

  if (showBuilder) {
    return (
      <NotificationBuilder
        organization={duplicateData?.company || undefined}
        duplicateData={duplicateData || undefined}
        onSuccess={handleBuilderSuccess}
        onCancel={handleBuilderCancel}
      />
    )
  }

  if (showSettings) {
    return (
      <div>
        <button
          onClick={() => setShowSettings(false)}
          className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
        >
          ← Back to Notifications
        </button>
        <NotificationSettings />
      </div>
    )
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = vehicleSearchTerm.toLowerCase()
    return (
      vehicle.registration.toLowerCase().includes(searchLower) ||
      vehicle.type.toLowerCase().includes(searchLower) ||
      (vehicle.note && vehicle.note.toLowerCase().includes(searchLower)) ||
      (vehicle.year && vehicle.year.toString().includes(searchLower))
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">All Vehicle Notifications</h2>
          <p className="text-gray-400 mt-1">{filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-pictus-black rounded-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Notification</span>
          </button>
        </div>
      </div>

      {/* Vehicle Management Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex items-center mb-4">
          <Car className="h-5 w-5 text-pictus-lime mr-2" />
          <h3 className="text-lg font-semibold text-white">Vehicle Management</h3>
        </div>

        <div className="space-y-4">
          {/* Organization Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Organization
            </label>
            <select
              value={selectedOrganization}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
            >
              <option value="">Select an organization...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.name}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle List */}
          {selectedOrganization && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} for {selectedOrganization}
                </p>
                <button
                  onClick={handleCreateVehicle}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-pictus-black rounded-lg transition-all text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Vehicle</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles by registration, type, or note..."
                  value={vehicleSearchTerm}
                  onChange={(e) => setVehicleSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pictus-lime"
                />
              </div>

              {vehiclesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin mx-auto w-12 h-12 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-full flex items-center justify-center">
                    <Car className="h-6 w-6 text-pictus-black" />
                  </div>
                  <p className="text-gray-400 mt-2">Loading vehicles...</p>
                </div>
              ) : filteredVehicles.length > 0 ? (
                <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Registration
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Year
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Note
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Created By
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredVehicles.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {vehicle.registration}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {vehicle.type}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {vehicle.year || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-300 max-w-xs truncate">
                              {vehicle.note || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {vehicle.user ? `${vehicle.user.firstName || ''} ${vehicle.user.lastName || ''}`.trim() || vehicle.user.email : 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditVehicle(vehicle)}
                                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all"
                                title="Edit vehicle"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
                                title="Delete vehicle"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                  <Car className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No vehicles found for this organization</p>
                  <button
                    onClick={handleCreateVehicle}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-pictus-black rounded-lg transition-all text-sm"
                  >
                    Add First Vehicle
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Testing Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex items-center mb-4">
          <TestTube className="h-5 w-5 text-pictus-lime mr-2" />
          <h3 className="text-lg font-semibold text-white">Testing Section</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <select
              value={selectedNotificationId}
              onChange={(e) => setSelectedNotificationId(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
            >
              <option value="">Select a notification ID...</option>
              {(Array.isArray(notifications) ? notifications : []).map((notification) => (
                <option key={notification.id} value={notification.id}>
                  ID: {notification.id} - {notification.vehicleRegistration || 'No registration'} ({notification.status})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleTestStatusUpdate}
            disabled={!selectedNotificationId || testingLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 disabled:bg-gray-600 disabled:cursor-not-allowed text-pictus-black text-[14px] font-normal rounded-lg transition-all shadow-lg hover:shadow-pictus-lime/50"
          >
            {testingLoading ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4" />
                <span>Set to Imported & Clear Dates</span>
              </>
            )}
          </button>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          This will set the selected notification status to &quot;imported&quot; and clear emailSentAt, smsSentAt and confirmedAt fields.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search notifications by ID, email, name, company, registration, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Notifications Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Person/Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredNotifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      #{notification.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {notification.personName || 'N/A'}
                      </div>
                      {notification.company && (
                        <div className="text-sm text-gray-400 flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {notification.company}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {notification.vehicleRegistration || 'N/A'}
                      </div>
                      {notification.vehicleType && (
                        <div className="text-sm text-gray-400">
                          {notification.vehicleType}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {notification.email && (
                        <div className="text-sm text-gray-300 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {notification.email}
                        </div>
                      )}
                      {notification.phoneNumber && (
                        <div className="text-sm text-gray-300 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {notification.phoneNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(notification.status)}`}>
                      {notification.status === 'sent' ? 'Odoslané' :
                       notification.status === 'confirmed' ? 'Potvrdené' :
                       notification.status === 'pending' ? 'Čaká' :
                       notification.status === 'failed' ? 'Zlyhalo' :
                       notification.status === 'imported' ? 'Importované' :
                       notification.status.toLowerCase().startsWith('reminded') ? 'Pripomenuté' :
                       notification.status === 'no_response' ? 'Bez odpovede' :
                       notification.status}
                    </span>
                    {notification.confirmationAttempts > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        Pokusy: {notification.confirmationAttempts}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="space-y-1">
                      {notification.notificationDate && (
                        <div suppressHydrationWarning className="text-pictus-lime font-medium">Notifikácia: {new Date(notification.notificationDate).toLocaleDateString('sk-SK')}</div>
                      )}
                      {notification.dutyDate && (
                        <div suppressHydrationWarning>Termín: {new Date(notification.dutyDate).toLocaleDateString('sk-SK')}</div>
                      )}
                      {notification.emailSentAt && (
                        <div suppressHydrationWarning>Email odoslaný: {new Date(notification.emailSentAt).toLocaleDateString('sk-SK')}</div>
                      )}
                      {notification.smsSentAt && (
                        <div suppressHydrationWarning>SMS odoslaný: {new Date(notification.smsSentAt).toLocaleDateString('sk-SK')}</div>
                      )}
                      {notification.confirmedAt && (
                        <div suppressHydrationWarning>Potvrdené: {new Date(notification.confirmedAt).toLocaleDateString('sk-SK')}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex items-center" suppressHydrationWarning>
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDuplicate(notification)}
                        className="flex items-center gap-1 px-3 py-1 bg-pictus-lime/20 hover:bg-pictus-lime/30 text-pictus-lime border border-pictus-lime/30 rounded-lg transition-all text-sm"
                        title="Duplicate this notification"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all text-sm"
                        title="Delete this notification"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredNotifications.length === 0 && !loading && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-full flex items-center justify-center mb-4">
              <Car className="h-8 w-8 text-pictus-black" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Vehicle Notifications Found</h3>
            <p className="text-gray-400">No notifications match your search criteria</p>
          </div>
        </div>
      )}

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <VehicleModal
          isOpen={showVehicleModal}
          onClose={handleVehicleModalClose}
          onSuccess={handleVehicleModalSuccess}
          vehicle={editingVehicle}
          organization={selectedOrganization}
        />
      )}
    </div>
  )
}

// Vehicle Modal Component
interface VehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  vehicle: Vehicle | null
  organization: string
}

function VehicleModal({ isOpen, onClose, onSuccess, vehicle, organization }: VehicleModalProps) {
  const [formData, setFormData] = useState({
    type: vehicle?.type || '',
    registration: vehicle?.registration || '',
    year: vehicle?.year?.toString() || '',
    image: vehicle?.image || '',
    note: vehicle?.note || '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (vehicle) {
      setFormData({
        type: vehicle.type || '',
        registration: vehicle.registration || '',
        year: vehicle.year?.toString() || '',
        image: vehicle.image || '',
        note: vehicle.note || '',
      })
    } else {
      setFormData({
        type: '',
        registration: '',
        year: '',
        image: '',
        note: '',
      })
    }
  }, [vehicle])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type || !formData.registration) {
      alert('Type and registration are required')
      return
    }

    setSaving(true)

    try {
      const url = vehicle ? `/api/my-vehicles/${vehicle.id}` : '/api/my-vehicles'
      const method = vehicle ? 'PUT' : 'POST'

      const body: any = {
        type: formData.type,
        registration: formData.registration,
        year: formData.year ? parseInt(formData.year) : null,
        image: formData.image || null,
        note: formData.note || null,
      }

      // Only include organization for new vehicles
      if (!vehicle) {
        body.organization = organization
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const errorData = await response.json()
        alert(`Failed to save vehicle: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to save vehicle:', error)
      alert('Error saving vehicle')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-pictus-black border border-white/10 rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">
          {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vehicle Type <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
              placeholder="e.g., Sedan, SUV, Truck"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Registration <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.registration}
              onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
              placeholder="e.g., ABC-1234"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Year
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
              placeholder="e.g., 2024"
              min="1900"
              max="2100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image URL
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Note
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
              placeholder="Additional notes about this vehicle"
              rows={3}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 disabled:opacity-50 text-pictus-black rounded-lg transition-all"
            >
              {saving ? 'Saving...' : vehicle ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}