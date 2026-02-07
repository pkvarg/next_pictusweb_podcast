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
  RotateCcw
} from 'lucide-react'

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

  useEffect(() => {
    fetchNotifications()
  }, [])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">All Vehicle Notifications</h2>
          <p className="text-gray-400 mt-1">{filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} total</p>
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
                      {notification.status}
                    </span>
                    {notification.confirmationAttempts > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        Attempts: {notification.confirmationAttempts}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="space-y-1">
                      {notification.emailSentAt && (
                        <div suppressHydrationWarning>Email Sent: {new Date(notification.emailSentAt).toLocaleDateString()}</div>
                      )}
                      {notification.smsSentAt && (
                        <div suppressHydrationWarning>SMS Sent: {new Date(notification.smsSentAt).toLocaleDateString()}</div>
                      )}
                      {notification.confirmedAt && (
                        <div suppressHydrationWarning>Confirmed: {new Date(notification.confirmedAt).toLocaleDateString()}</div>
                      )}
                      {notification.dutyDate && (
                        <div suppressHydrationWarning>Duty: {new Date(notification.dutyDate).toLocaleDateString()}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex items-center" suppressHydrationWarning>
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(notification.createdAt).toLocaleDateString()}
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
    </div>
  )
}