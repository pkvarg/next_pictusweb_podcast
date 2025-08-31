'use client'

import { useEffect, useState } from 'react'
import { 
  Car, 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Mail, 
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Filter,
  ChevronDown,
  ChevronUp
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
  status: string
  emailSentAt: string | null
  smsSentAt: string | null
  createdAt: string
  confirmedAt: string | null
  confirmationAttempts: number
}

interface VehicleGroup {
  vehicleRegistration: string | null
  vehicleType: string | null
  notifications: VehicleNotification[]
}

interface DashboardStats {
  totalNotifications: number
  pendingNotifications: number
  confirmedNotifications: number
  emailsSent: number
  smsSent: number
  notificationTypes: { [key: string]: number }
  recentNotifications: VehicleNotification[]
  upcomingWeek: VehicleNotification[]
  upcomingMonth: VehicleNotification[]
  vehicleGroups: VehicleGroup[]
}

type TimeFilter = 'all' | 'week' | 'month'

interface VehicleNotificationsDashboardProps {
  company: string
}

const VehicleNotificationsDashboard = ({ company }: VehicleNotificationsDashboardProps) => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/vehicle-notifications?company=${company}`)
        if (response.ok) {
          const data = await response.json()
          
          // Process the data to create stats
          const notifications = data.notifications || []
          
          // Sort notifications by notificationDate first
          const sortedNotifications = notifications.sort((a: VehicleNotification, b: VehicleNotification) => {
            if (!a.notificationDate && !b.notificationDate) return 0
            if (!a.notificationDate) return 1
            if (!b.notificationDate) return -1
            return new Date(a.notificationDate).getTime() - new Date(b.notificationDate).getTime()
          })
          
          // Calculate time-based filters
          const now = new Date()
          const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          
          const upcomingWeek = sortedNotifications.filter((n: VehicleNotification) => {
            if (!n.notificationDate) return false
            const notificationDate = new Date(n.notificationDate)
            return notificationDate >= now && notificationDate <= oneWeekFromNow
          })
          
          const upcomingMonth = sortedNotifications.filter((n: VehicleNotification) => {
            if (!n.notificationDate) return false
            const notificationDate = new Date(n.notificationDate)
            return notificationDate >= now && notificationDate <= oneMonthFromNow
          })
          
          // Group notifications by vehicle registration
          const vehicleMap = new Map<string, VehicleGroup>()
          
          sortedNotifications.forEach((notification: VehicleNotification) => {
            const key = notification.vehicleRegistration || 'Unknown Vehicle'
            
            if (!vehicleMap.has(key)) {
              vehicleMap.set(key, {
                vehicleRegistration: notification.vehicleRegistration,
                vehicleType: notification.vehicleType,
                notifications: []
              })
            }
            
            vehicleMap.get(key)!.notifications.push(notification)
          })
          
          const vehicleGroups = Array.from(vehicleMap.values()).sort((a, b) => {
            const aReg = a.vehicleRegistration || 'Unknown Vehicle'
            const bReg = b.vehicleRegistration || 'Unknown Vehicle'
            return aReg.localeCompare(bReg)
          })
          
          const processedStats: DashboardStats = {
            totalNotifications: notifications.length,
            pendingNotifications: notifications.filter((n: VehicleNotification) => n.status === 'pending').length,
            confirmedNotifications: notifications.filter((n: VehicleNotification) => n.confirmedAt !== null).length,
            emailsSent: notifications.filter((n: VehicleNotification) => n.emailSentAt !== null).length,
            smsSent: notifications.filter((n: VehicleNotification) => n.smsSentAt !== null).length,
            notificationTypes: notifications.reduce((acc: { [key: string]: number }, n: VehicleNotification) => {
              if (n.notificationType) {
                acc[n.notificationType] = (acc[n.notificationType] || 0) + 1
              }
              return acc
            }, {}),
            recentNotifications: notifications
              .sort((a: VehicleNotification, b: VehicleNotification) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5),
            upcomingWeek,
            upcomingMonth,
            vehicleGroups
          }
          
          setStats(processedStats)
        }
      } catch (error) {
        console.error('Error fetching vehicle notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [company])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <p className="text-gray-300">No data available for {company}</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-400/20'
      case 'pending': return 'text-yellow-400 bg-yellow-400/20'
      case 'failed': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleVehicleExpanded = (vehicleKey: string) => {
    setExpandedVehicles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(vehicleKey)) {
        newSet.delete(vehicleKey)
      } else {
        newSet.add(vehicleKey)
      }
      return newSet
    })
  }

  const getFilteredNotifications = () => {
    if (!stats) return []
    
    switch (timeFilter) {
      case 'week':
        return stats.upcomingWeek
      case 'month':
        return stats.upcomingMonth
      default:
        return stats.vehicleGroups.flatMap(group => group.notifications)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl">
          <Car className="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">{company} Dashboard</h2>
          <p className="text-gray-300">Vehicle Notifications Management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium">Total Notifications</p>
              <p className="text-3xl font-bold text-white">{stats.totalNotifications}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-sm font-medium">This Week</p>
              <p className="text-3xl font-bold text-white">{stats.upcomingWeek.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 rounded-xl p-6 border border-pink-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-300 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-white">{stats.upcomingMonth.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-pink-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium">Confirmed</p>
              <p className="text-3xl font-bold text-white">{stats.confirmedNotifications}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-sm font-medium">Vehicles</p>
              <p className="text-3xl font-bold text-white">{stats.vehicleGroups.length}</p>
            </div>
            <Car className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Notification Types Chart */}
      <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Notification Types Distribution
        </h3>
        <div className="space-y-4">
          {Object.entries(stats.notificationTypes).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-gray-300">{type}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(count / stats.totalNotifications) * 100}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Filter Controls */}
      <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Notifications
          </h3>
          <div className="flex gap-2">
            {(['all', 'week', 'month'] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeFilter === filter
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Notifications by Registration */}
      <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Car className="w-5 h-5" />
          Notifications by Vehicle
          {timeFilter !== 'all' && (
            <span className="text-sm text-purple-300 font-normal">
              ({timeFilter === 'week' ? 'Next 7 days' : 'Next 30 days'})
            </span>
          )}
        </h3>
        
        {timeFilter === 'all' ? (
          // Show grouped by vehicle
          <div className="space-y-4">
            {stats.vehicleGroups.map((vehicleGroup) => {
              const vehicleKey = vehicleGroup.vehicleRegistration || 'Unknown Vehicle'
              const isExpanded = expandedVehicles.has(vehicleKey)
              
              return (
                <div key={vehicleKey} className="bg-black/30 rounded-lg border border-purple-500/20">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-500/10 transition-colors"
                    onClick={() => toggleVehicleExpanded(vehicleKey)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-600/20 rounded-lg">
                        <Car className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          {vehicleGroup.vehicleRegistration || 'Unknown Vehicle'}
                        </h4>
                        <p className="text-gray-400 text-sm">{vehicleGroup.vehicleType || 'Unknown Type'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white font-bold">{vehicleGroup.notifications.length}</p>
                        <p className="text-gray-400 text-sm">notifications</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-purple-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t border-purple-500/20 p-4">
                      <div className="space-y-3">
                        {vehicleGroup.notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(notification.status)}`}>
                                  {notification.status}
                                </span>
                                <span className="text-gray-400 text-sm">#{notification.id}</span>
                              </div>
                              <div className="text-right text-sm">
                                {notification.notificationDate && (
                                  <p className="text-purple-300">
                                    Due: {formatDateTime(notification.notificationDate)}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-purple-300 text-sm">Notification</p>
                                <p className="text-white font-medium">{notification.notificationType}</p>
                                <p className="text-gray-400 text-sm">{notification.notificationChannel}</p>
                              </div>
                              <div>
                                <p className="text-purple-300 text-sm">Contact</p>
                                <p className="text-white">{notification.personName || 'N/A'}</p>
                                <p className="text-gray-400 text-sm">{notification.email}</p>
                              </div>
                              <div>
                                <p className="text-purple-300 text-sm">Communication</p>
                                <div className="flex gap-2 mt-1">
                                  {notification.emailSentAt && (
                                    <span className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded">
                                      Email ✓
                                    </span>
                                  )}
                                  {notification.smsSentAt && (
                                    <span className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded">
                                      SMS ✓
                                    </span>
                                  )}
                                  {notification.confirmationAttempts > 0 && (
                                    <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 text-xs rounded">
                                      {notification.confirmationAttempts} attempts
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          // Show upcoming notifications as flat list
          <div className="space-y-4">
            {getFilteredNotifications().length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  No upcoming notifications for {timeFilter === 'week' ? 'this week' : 'this month'}
                </p>
              </div>
            ) : (
              getFilteredNotifications().map((notification) => (
                <div 
                  key={notification.id}
                  className="bg-black/30 rounded-lg p-4 border border-purple-500/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                      <span className="text-gray-400 text-sm">#{notification.id}</span>
                    </div>
                    <div className="text-right text-sm">
                      {notification.notificationDate && (
                        <p className="text-purple-300 font-medium">
                          Due: {formatDateTime(notification.notificationDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-purple-300 text-sm">Vehicle</p>
                      <p className="text-white font-medium">{notification.vehicleRegistration || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">{notification.vehicleType}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Notification</p>
                      <p className="text-white font-medium">{notification.notificationType}</p>
                      <p className="text-gray-400 text-sm">{notification.notificationChannel}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Contact</p>
                      <p className="text-white">{notification.personName || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">{notification.email}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm">Communication</p>
                      <div className="flex gap-2 mt-1">
                        {notification.emailSentAt && (
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded">
                            Email ✓
                          </span>
                        )}
                        {notification.smsSentAt && (
                          <span className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded">
                            SMS ✓
                          </span>
                        )}
                        {notification.confirmationAttempts > 0 && (
                          <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 text-xs rounded">
                            {notification.confirmationAttempts} attempts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 rounded-xl p-6 border border-indigo-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Communications
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Emails Sent</span>
              <span className="text-white font-bold">{stats.emailsSent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Email Rate</span>
              <span className="text-white font-bold">
                {stats.totalNotifications > 0 ? Math.round((stats.emailsSent / stats.totalNotifications) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-600/20 to-teal-800/20 rounded-xl p-6 border border-teal-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Communications
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">SMS Sent</span>
              <span className="text-white font-bold">{stats.smsSent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">SMS Rate</span>
              <span className="text-white font-bold">
                {stats.totalNotifications > 0 ? Math.round((stats.smsSent / stats.totalNotifications) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleNotificationsDashboard