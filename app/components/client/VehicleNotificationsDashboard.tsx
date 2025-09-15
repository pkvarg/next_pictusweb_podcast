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
  ChevronUp,
} from 'lucide-react'
import VehicleCardsDashboard from './VehicleCardsDashboard'

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
          const sortedNotifications = notifications.sort(
            (a: VehicleNotification, b: VehicleNotification) => {
              if (!a.notificationDate && !b.notificationDate) return 0
              if (!a.notificationDate) return 1
              if (!b.notificationDate) return -1
              return new Date(a.notificationDate).getTime() - new Date(b.notificationDate).getTime()
            },
          )

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
                notifications: [],
              })
            }

            vehicleMap.get(key)!.notifications.push(notification)
          })

          const vehicleGroups = Array.from(vehicleMap.values()).sort((a, b) => {
            const aReg = a.vehicleRegistration || 'Unknown Vehicle'
            const bReg = b.vehicleRegistration || 'Unknown Vehicle'
            return aReg.localeCompare(bReg)
          })

          // Count unique tasks (same type + duty date = one task) for top widgets
          const uniqueTasksMap = new Map<string, VehicleNotification>()
          notifications.forEach((n: VehicleNotification) => {
            const taskKey = `${n.notificationType || 'Unknown'}-${n.dutyDate || 'No Date'}`
            if (!uniqueTasksMap.has(taskKey)) {
              uniqueTasksMap.set(taskKey, n)
            }
          })
          const uniqueTasks = Array.from(uniqueTasksMap.values())

          const processedStats: DashboardStats = {
            totalNotifications: notifications.length, // Keep original for notification-based widgets
            pendingNotifications: notifications.filter(
              (n: VehicleNotification) => n.status === 'pending',
            ).length,
            confirmedNotifications: notifications.filter(
              (n: VehicleNotification) => n.confirmedAt !== null,
            ).length,
            emailsSent: notifications.filter((n: VehicleNotification) => n.emailSentAt !== null)
              .length,
            smsSent: notifications.filter((n: VehicleNotification) => n.smsSentAt !== null).length,
            notificationTypes: uniqueTasks.reduce(
              (acc: { [key: string]: number }, n: VehicleNotification) => {
                if (n.notificationType) {
                  acc[n.notificationType] = (acc[n.notificationType] || 0) + 1
                }
                return acc
              },
              {},
            ), // Count unique tasks for task-based widgets
            recentNotifications: notifications
              .sort(
                (a: VehicleNotification, b: VehicleNotification) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
              )
              .slice(0, 5),
            upcomingWeek,
            upcomingMonth,
            vehicleGroups,
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
        <p className="text-white text-2xl">Žiadne údaje nie sú dostupné pre {company}</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-400/20'
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20'
      case 'failed':
        return 'text-red-400 bg-red-400/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getVehicleUrgency = (notifications: VehicleNotification[]) => {
    const now = new Date()
    let minDaysToTask: number | null = null

    // Find the closest upcoming duty date
    notifications.forEach((notification) => {
      if (notification.dutyDate) {
        const dutyDate = new Date(notification.dutyDate)
        if (dutyDate >= now) {
          const timeDiff = dutyDate.getTime() - now.getTime()
          const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))
          if (minDaysToTask === null || daysRemaining < minDaysToTask) {
            minDaysToTask = daysRemaining
          }
        }
      }
    })

    if (minDaysToTask === null) return 'gray'
    if (minDaysToTask <= 10) return 'red'
    if (minDaysToTask <= 30) return 'orange'
    return 'green'
  }

  const getNotificationUrgency = (notification: VehicleNotification) => {
    // Use notificationDate since that's what's displayed as "Termín"
    if (!notification.notificationDate) return 'gray'

    const now = new Date()
    const notificationDate = new Date(notification.notificationDate)

    // Check if the date is valid
    if (isNaN(notificationDate.getTime())) return 'gray'

    if (notificationDate < now) return 'gray' // Past due dates

    const timeDiff = notificationDate.getTime() - now.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

    if (daysRemaining <= 10) return 'red'
    if (daysRemaining <= 30) return 'orange'
    return 'green'
  }

  const getDaysToNotification = (notificationDate: string | null) => {
    if (!notificationDate) return null

    const now = new Date()
    const targetDate = new Date(notificationDate)

    if (isNaN(targetDate.getTime())) return null

    const timeDiff = targetDate.getTime() - now.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

    if (daysRemaining < 0) return null // Past dates
    return daysRemaining
  }

  const getUrgencyStyles = (urgencyLevel: 'green' | 'orange' | 'red' | 'gray') => {
    switch (urgencyLevel) {
      case 'red':
        return {
          border: 'border-red-500/50',
          bg: 'from-red-600/20 to-red-800/20',
          text: 'text-red-500',
          icon: 'text-red-400',
        }
      case 'orange':
        return {
          border: 'border-orange-500/50',
          bg: 'from-orange-600/20 to-orange-800/20',
          text: 'text-orange-500',
          icon: 'text-orange-400',
        }
      case 'green':
        return {
          border: 'border-green-500/50',
          bg: 'from-green-600/20 to-green-800/20',
          text: 'text-green-400',
          icon: 'text-green-400',
        }
      default:
        return {
          border: 'border-purple-500/20',
          bg: 'from-gray-600/20 to-gray-800/20',
          text: 'text-gray-300',
          icon: 'text-purple-400',
        }
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const toggleVehicleExpanded = (vehicleKey: string) => {
    setExpandedVehicles((prev) => {
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
        return stats.vehicleGroups.flatMap((group) => group.notifications)
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
          <h2 className="text-5xl font-bold text-white">{company} Dashboard</h2>
          <p className="text-white text-2xl">Správa notifikácií vozidiel</p>
        </div>
      </div>

      {/* Task Type Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(stats.notificationTypes)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([type, count], index) => {
            const colors = [
              {
                bg: 'from-blue-600/20 to-blue-800/20',
                border: 'border-blue-500/30',
                text: 'text-blue-300',
                icon: 'text-blue-400',
              },
              {
                bg: 'from-green-600/20 to-green-800/20',
                border: 'border-green-500/30',
                text: 'text-green-300',
                icon: 'text-green-400',
              },
              {
                bg: 'from-purple-600/20 to-purple-800/20',
                border: 'border-purple-500/30',
                text: 'text-purple-300',
                icon: 'text-purple-400',
              },
              {
                bg: 'from-orange-600/20 to-orange-800/20',
                border: 'border-orange-500/30',
                text: 'text-orange-300',
                icon: 'text-orange-400',
              },
              {
                bg: 'from-pink-600/20 to-pink-800/20',
                border: 'border-pink-500/30',
                text: 'text-pink-300',
                icon: 'text-pink-400',
              },
            ]
            const color = colors[index % colors.length]

            return (
              <div
                key={type}
                className={`bg-gradient-to-br ${color.bg} rounded-xl p-6 border ${color.border}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${color.text} text-xl font-medium`}>{type}</p>
                    <p className="text-5xl font-bold text-white">{count}</p>
                  </div>
                  <Bell className={`w-8 h-8 ${color.icon}`} />
                </div>
              </div>
            )
          })}
      </div>

      {/* Vehicle Cards Dashboard */}
      <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-2 lg:p-6 border border-purple-500/30">
        <VehicleCardsDashboard company={company} />
      </div>

      {/* Original Notification Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-xl font-medium">Celkové notifikácie</p>
              <p className="text-5xl font-bold text-white">{stats.totalNotifications}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 text-xl font-medium">Tento týždeň</p>
              <p className="text-5xl font-bold text-white">{stats.upcomingWeek.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 rounded-xl p-6 border border-pink-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-300 text-xl font-medium">Tento mesiac</p>
              <p className="text-5xl font-bold text-white">{stats.upcomingMonth.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-pink-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-xl font-medium">Potvrdené</p>
              <p className="text-5xl font-bold text-white">{stats.confirmedNotifications}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300 text-xl font-medium">Vozidlá</p>
              <p className="text-5xl font-bold text-white">{stats.vehicleGroups.length}</p>
            </div>
            <Car className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Notification Types Chart */}
      <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-4xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="w-8 h-8" />
          Distribúcia typov notifikácií
        </h3>
        <div className="space-y-4">
          {Object.entries(stats.notificationTypes).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-white text-xl">{type}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(count / stats.totalNotifications) * 100}%` }}
                  ></div>
                </div>
                <span className="text-white font-medium w-8 text-right text-xl">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Filter Controls */}
      <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-3 md:p-6 border border-purple-500/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-6">
          <h3 className="text-2xl md:text-4xl font-bold text-white flex items-center gap-2">
            <Filter className="w-6 h-6 md:w-8 md:h-8" />
            Filtrovať notifikácie
          </h3>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            {(['all', 'week', 'month'] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-xl font-medium transition-all flex-1 md:flex-none ${
                  timeFilter === filter
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {filter === 'all' ? 'Všetky' : filter === 'week' ? 'Tento týždeň' : 'Tento mesiac'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Notifications by Registration */}
      <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-xl p-2 lg:p-6 border border-purple-500/30">
        <h3 className="text-4xl font-bold text-white mb-6 flex items-center gap-2">
          <Car className="w-8 h-8" />
          Notifikácie podľa vozidla
          {timeFilter !== 'all' && (
            <span className="text-xl text-purple-300 font-normal">
              ({timeFilter === 'week' ? 'Nasledujúcich 7 dní' : 'Nasledujúcich 30 dní'})
            </span>
          )}
        </h3>

        {timeFilter === 'all' ? (
          // Show grouped by vehicle
          <div className="space-y-4">
            {stats.vehicleGroups.map((vehicleGroup) => {
              const vehicleKey = vehicleGroup.vehicleRegistration || 'Unknown Vehicle'
              const isExpanded = expandedVehicles.has(vehicleKey)
              const urgencyLevel = getVehicleUrgency(vehicleGroup.notifications)
              const styles = getUrgencyStyles(urgencyLevel)

              return (
                <div key={vehicleKey} className={`bg-black/30 rounded-lg border ${styles.border}`}>
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer hover:opacity-80 transition-all bg-gradient-to-r ${styles.bg}`}
                    onClick={() => toggleVehicleExpanded(vehicleKey)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 bg-gradient-to-r ${styles.bg} rounded-lg border ${styles.border}`}
                      >
                        <Car className={`w-5 h-5 ${styles.icon}`} />
                      </div>
                      <div>
                        <h4 className="text-4xl font-bold text-white">
                          {vehicleGroup.vehicleRegistration || 'Neznáme vozidlo'}
                        </h4>
                        <p className="text-white text-lg">
                          {vehicleGroup.vehicleType || 'Neznámy typ'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white font-bold text-2xl">
                          {vehicleGroup.notifications.length}
                        </p>
                        <p className="text-white text-lg">notifikácií</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className={`w-5 h-5 ${styles.icon}`} />
                      ) : (
                        <ChevronDown className={`w-5 h-5 ${styles.icon}`} />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className={`border-t ${styles.border} p-4`}>
                      <div className="space-y-3">
                        {vehicleGroup.notifications.map((notification) => {
                          const notificationUrgency = getNotificationUrgency(notification)
                          const notificationStyles = getUrgencyStyles(notificationUrgency)

                          return (
                            <div
                              key={notification.id}
                              className={`bg-gradient-to-r ${notificationStyles.bg} rounded-lg p-4 border ${notificationStyles.border}`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                      notification.status,
                                    )}`}
                                  >
                                    {notification.status}
                                  </span>
                                  <span className="text-white text-lg">#{notification.id}</span>
                                </div>
                                <div className="text-right text-sm">
                                  {notification.notificationDate && (
                                    <div>
                                      <p className="text-purple-300 text-lg">
                                        Termín: {formatDateTime(notification.notificationDate)}
                                      </p>
                                      {getDaysToNotification(notification.notificationDate) !==
                                        null && (
                                        <p
                                          className={`text-xl md:text-2xl font-bold ${notificationStyles.text}`}
                                        >
                                          zostáva{' '}
                                          {getDaysToNotification(notification.notificationDate)} dní
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-purple-300 text-lg">Notifikácia</p>
                                  <p className="text-white font-medium text-xl">
                                    {notification.notificationType}
                                  </p>
                                  <p className="text-white text-lg">
                                    {notification.notificationChannel}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-purple-300 text-lg">Kontakt</p>
                                  <p className="text-white text-xl">
                                    {notification.personName || 'Nedostupné'}
                                  </p>
                                  <p className="text-white text-lg">{notification.email}</p>
                                </div>
                                <div>
                                  <p className="text-purple-300 text-lg">Komunikácia</p>
                                  <div className="flex gap-2 mt-1">
                                    {notification.emailSentAt && (
                                      <span className="px-3 py-2 bg-blue-600/20 text-blue-300 text-lg rounded">
                                        Email ✓
                                      </span>
                                    )}
                                    {notification.smsSentAt && (
                                      <span className="px-3 py-2 bg-green-600/20 text-green-300 text-lg rounded">
                                        SMS ✓
                                      </span>
                                    )}
                                    {notification.confirmationAttempts > 0 && (
                                      <span className="px-3 py-2 bg-yellow-600/20 text-yellow-300 text-lg rounded">
                                        {notification.confirmationAttempts} pokusov
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
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
                <p className="text-white text-2xl">
                  Žiadne nadchádzajúce notifikácie pre{' '}
                  {timeFilter === 'week' ? 'tento týždeň' : 'tento mesiac'}
                </p>
              </div>
            ) : (
              getFilteredNotifications().map((notification) => {
                const notificationUrgency = getNotificationUrgency(notification)
                const notificationStyles = getUrgencyStyles(notificationUrgency)

                return (
                  <div
                    key={notification.id}
                    className={`bg-gradient-to-r ${notificationStyles.bg} rounded-lg p-4 border ${notificationStyles.border}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            notification.status,
                          )}`}
                        >
                          {notification.status}
                        </span>
                        <span className="text-white text-lg">#{notification.id}</span>
                      </div>
                      <div className="text-right text-sm">
                        {notification.notificationDate && (
                          <div>
                            <p className="text-purple-300 font-medium text-lg">
                              Termín: {formatDateTime(notification.notificationDate)}
                            </p>
                            {getDaysToNotification(notification.notificationDate) !== null && (
                              <p
                                className={`text-xl md:text-2xl font-bold ${notificationStyles.text}`}
                              >
                                zostáva {getDaysToNotification(notification.notificationDate)} dní
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-purple-300 text-lg">Vozidlo</p>
                        <p className="text-white font-bold text-3xl">
                          {notification.vehicleRegistration || 'Nedostupné'}
                        </p>
                        <p className="text-white text-lg">{notification.vehicleType}</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-lg">Oznámenie</p>
                        <p className="text-white font-medium text-xl">
                          {notification.notificationType}
                        </p>
                        <p className="text-white text-lg">{notification.notificationChannel}</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-lg">Kontakt</p>
                        <p className="text-white text-xl">
                          {notification.personName || 'Nedostupné'}
                        </p>
                        <p className="text-white text-lg">{notification.email}</p>
                      </div>
                      <div>
                        <p className="text-purple-300 text-lg">Komunikácia</p>
                        <div className="flex gap-2 mt-1">
                          {notification.emailSentAt && (
                            <span className="px-3 py-2 bg-blue-600/20 text-blue-300 text-lg rounded">
                              Email ✓
                            </span>
                          )}
                          {notification.smsSentAt && (
                            <span className="px-3 py-2 bg-green-600/20 text-green-300 text-lg rounded">
                              SMS ✓
                            </span>
                          )}
                          {notification.confirmationAttempts > 0 && (
                            <span className="px-3 py-2 bg-yellow-600/20 text-yellow-300 text-lg rounded">
                              {notification.confirmationAttempts} pokusov
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Communication Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 rounded-xl p-6 border border-indigo-500/30">
          <h3 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-8 h-8" />
            E-mailová komunikácia
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white text-xl">Odoslané e-maily</span>
              <span className="text-white font-bold text-2xl">{stats.emailsSent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white text-xl">Pomer e-mailov</span>
              <span className="text-white font-bold text-2xl">
                {stats.totalNotifications > 0
                  ? Math.round((stats.emailsSent / stats.totalNotifications) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-600/20 to-teal-800/20 rounded-xl p-6 border border-teal-500/30">
          <h3 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            SMS komunikácia
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white text-xl">Odoslané SMS</span>
              <span className="text-white font-bold text-2xl">{stats.smsSent}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white text-xl">Pomer SMS</span>
              <span className="text-white font-bold text-2xl">
                {stats.totalNotifications > 0
                  ? Math.round((stats.smsSent / stats.totalNotifications) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleNotificationsDashboard
