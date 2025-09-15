'use client'

import { useEffect, useState } from 'react'
import {
  Car,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
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

interface TaskGroup {
  notificationType: string | null
  dutyDate: string | null
  tasks: VehicleNotification[]
  daysRemaining: number | null
  urgencyLevel: 'green' | 'orange' | 'red' | 'gray'
}

interface VehicleCard {
  vehicleRegistration: string
  vehicleType: string | null
  nextTask: VehicleNotification | null
  allTasks: VehicleNotification[]
  taskGroups: TaskGroup[]
  daysToNextTask: number | null
  urgencyLevel: 'green' | 'orange' | 'red' | 'gray'
}

interface VehicleCardsDashboardProps {
  company: string
}

const VehicleCardsDashboard = ({ company }: VehicleCardsDashboardProps) => {
  const [vehicleCards, setVehicleCards] = useState<VehicleCard[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedTaskTypes, setExpandedTaskTypes] = useState<Set<string>>(new Set())
  const [expandedVehicles, setExpandedVehicles] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/vehicle-notifications?company=${company}`)
        if (response.ok) {
          const data = await response.json()
          const notifications = data.notifications || []

          // Group notifications by vehicle
          const vehicleMap = new Map<string, VehicleNotification[]>()

          notifications.forEach((notification: VehicleNotification) => {
            const key = notification.vehicleRegistration || 'Neznáme vozidlo'
            if (!vehicleMap.has(key)) {
              vehicleMap.set(key, [])
            }
            vehicleMap.get(key)!.push(notification)
          })

          // Create vehicle cards with next task information
          const cards: VehicleCard[] = []
          const now = new Date()

          vehicleMap.forEach((notifications, vehicleRegistration) => {
            // Sort notifications by duty date to find next task
            const sortedNotifications = notifications
              .filter((n) => n.dutyDate) // Only include notifications with duty dates
              .sort((a, b) => {
                const dateA = new Date(a.dutyDate!)
                const dateB = new Date(b.dutyDate!)
                return dateA.getTime() - dateB.getTime()
              })

            // Find next upcoming task (future date)
            const upcomingTasks = sortedNotifications.filter((n) => {
              const taskDate = new Date(n.dutyDate!)
              return taskDate >= now
            })

            const nextTask = upcomingTasks.length > 0 ? upcomingTasks[0] : null
            let daysToNextTask: number | null = null
            let urgencyLevel: 'green' | 'orange' | 'red' | 'gray' = 'gray'

            if (nextTask && nextTask.dutyDate) {
              const taskDate = new Date(nextTask.dutyDate)
              const timeDiff = taskDate.getTime() - now.getTime()
              daysToNextTask = Math.ceil(timeDiff / (1000 * 3600 * 24))

              // Determine urgency level based on days remaining
              if (daysToNextTask <= 10) {
                urgencyLevel = 'red'
              } else if (daysToNextTask <= 30) {
                urgencyLevel = 'orange'
              } else {
                urgencyLevel = 'green'
              }
            }

            // Group tasks by same type and duty date (treat as single tasks)
            const taskGroupMap = new Map<string, TaskGroup>()

            notifications.forEach((notification) => {
              const groupKey = `${notification.notificationType || 'Unknown'}-${
                notification.dutyDate || 'No Date'
              }`

              if (!taskGroupMap.has(groupKey)) {
                let groupDaysRemaining: number | null = null
                let groupUrgencyLevel: 'green' | 'orange' | 'red' | 'gray' = 'gray'

                if (notification.dutyDate) {
                  const taskDate = new Date(notification.dutyDate)
                  const timeDiff = taskDate.getTime() - now.getTime()
                  groupDaysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))

                  if (groupDaysRemaining <= 10) {
                    groupUrgencyLevel = 'red'
                  } else if (groupDaysRemaining <= 30) {
                    groupUrgencyLevel = 'orange'
                  } else {
                    groupUrgencyLevel = 'green'
                  }
                }

                taskGroupMap.set(groupKey, {
                  notificationType: notification.notificationType,
                  dutyDate: notification.dutyDate,
                  tasks: [notification],
                  daysRemaining: groupDaysRemaining,
                  urgencyLevel: groupUrgencyLevel,
                })
              } else {
                // Add notification to existing task group
                taskGroupMap.get(groupKey)!.tasks.push(notification)
              }
            })

            const taskGroups = Array.from(taskGroupMap.values()).sort((a, b) => {
              // Sort by duty date
              if (!a.dutyDate && !b.dutyDate) return 0
              if (!a.dutyDate) return 1
              if (!b.dutyDate) return -1
              return new Date(a.dutyDate).getTime() - new Date(b.dutyDate).getTime()
            })

            cards.push({
              vehicleRegistration,
              vehicleType: notifications[0]?.vehicleType || null,
              nextTask,
              allTasks: notifications,
              taskGroups,
              daysToNextTask,
              urgencyLevel,
            })
          })

          // Sort cards by urgency (red first, then orange, then green, then gray)
          const urgencyOrder = { red: 0, orange: 1, green: 2, gray: 3 }
          cards.sort((a, b) => {
            if (urgencyOrder[a.urgencyLevel] !== urgencyOrder[b.urgencyLevel]) {
              return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel]
            }
            // If same urgency, sort by days to next task (ascending)
            if (a.daysToNextTask !== null && b.daysToNextTask !== null) {
              return a.daysToNextTask - b.daysToNextTask
            }
            // If one has no next task, put it at the end
            if (a.daysToNextTask === null) return 1
            if (b.daysToNextTask === null) return -1
            return 0
          })

          setVehicleCards(cards)
        }
      } catch (error) {
        console.error('Error fetching vehicle notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [company])

  const toggleTaskTypeExpanded = (vehicleKey: string, taskType: string) => {
    const key = `${vehicleKey}-${taskType}`
    setExpandedTaskTypes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
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

  const getUrgencyStyles = (urgencyLevel: 'green' | 'orange' | 'red' | 'gray') => {
    switch (urgencyLevel) {
      case 'red':
        return {
          border: 'border-red-500/50',
          bg: 'from-red-600/20 to-red-800/20',
          text: 'text-red-300',
          icon: 'text-red-400',
        }
      case 'orange':
        return {
          border: 'border-orange-500/50',
          bg: 'from-orange-600/20 to-orange-800/20',
          text: 'text-orange-300',
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
          border: 'border-gray-500/50',
          bg: 'from-gray-600/20 to-gray-800/20',
          text: 'text-gray-300',
          icon: 'text-gray-400',
        }
    }
  }

  const getStatusIcon = (urgencyLevel: 'green' | 'orange' | 'red' | 'gray') => {
    switch (urgencyLevel) {
      case 'red':
        return <AlertTriangle className="w-6 h-6" />
      case 'orange':
        return <AlertCircle className="w-6 h-6" />
      case 'green':
        return <CheckCircle className="w-6 h-6" />
      default:
        return <Clock className="w-6 h-6" />
    }
  }

  const getTaskStatusColor = (status: string) => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (vehicleCards.length === 0) {
    return (
      <div className="text-center p-8">
        <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-white text-xl">Žiadne vozidlá neboli nájdené pre {company}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl">
          <Car className="w-10 h-10 text-purple-400" />
        </div>
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Karty vozidiel</h2>
          <p className="text-white text-xl md:text-2xl">
            Prehľad nadchádzajúcich úloh pre každé vozidlo
          </p>
        </div>
      </div>

      {/* Vehicle Cards List */}
      <div className="space-y-4">
        {vehicleCards.map((vehicle) => {
          const vehicleKey = vehicle.vehicleRegistration
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
                    <h4 className="text-4xl font-bold text-white">
                      {vehicle.vehicleRegistration}
                    </h4>
                    <p className="text-white text-lg">{vehicle.vehicleType || 'Neznámy typ'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-white font-bold text-2xl">{vehicle.taskGroups.length}</p>
                    <p className="text-white text-lg">úloh</p>
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
                  {/* Vehicle Task Details */}
                  <div className="space-y-6">
                    {/* Vehicle Header - Responsive */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8">
                      <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-0">
                        <Car className="w-6 h-6 md:w-12 md:h-12 text-purple-400" />
                        <div>
                          <h3 className="text-white font-bold text-3xl md:text-4xl">
                            {vehicle.vehicleRegistration}
                          </h3>
                          <p className="text-white text-lg md:text-2xl opacity-75">
                            {vehicle.vehicleType || 'Neznámy typ'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 md:gap-6">
                        {vehicle.daysToNextTask !== null && (
                          <div className="text-center md:text-right">
                            <p className="text-lg md:text-xl font-medium text-purple-300">
                              Nasledujúca úloha
                            </p>
                            <p className="text-5xl md:text-8xl font-bold text-purple-300">
                              {vehicle.daysToNextTask}{' '}
                              <span className="text-xl md:text-2xl font-medium text-purple-300">
                                dní
                              </span>
                            </p>
                          </div>
                        )}
                        <div className="text-purple-400">{getStatusIcon(vehicle.urgencyLevel)}</div>
                      </div>
                    </div>

                    {/* Task Groups */}
                    <div>
                      <h4 className="text-white font-bold text-2xl md:text-4xl mb-3 md:mb-6">
                        Úlohy podľa typu a termínu ({vehicle.taskGroups.length})
                      </h4>

                      {vehicle.taskGroups.length === 0 ? (
                        <div className="text-center py-12">
                          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                          <p className="text-gray-400 text-3xl">Žiadne úlohy</p>
                        </div>
                      ) : (
                        <div className="w-full space-y-1 md:space-y-6">
                          {(() => {
                            // Group task groups by notification type for display
                            const groupsByType = vehicle.taskGroups.reduce((acc, group) => {
                              const type = group.notificationType || 'Neznámy typ'
                              if (!acc[type]) {
                                acc[type] = []
                              }
                              acc[type].push(group)
                              return acc
                            }, {} as Record<string, TaskGroup[]>)

                            return Object.entries(groupsByType).map(([taskType, groups]) => {
                              const taskTypeKey = `${vehicle.vehicleRegistration}-${taskType}`
                              const isExpanded = expandedTaskTypes.has(taskTypeKey)
                              const visibleGroups = isExpanded ? groups : groups.slice(0, 3)

                              return (
                                <div
                                  key={taskType}
                                  className="w-full md:rounded-xl md:border border-gray-600/50"
                                >
                                  {/* Task Type Header */}
                                  <div className="p-3 md:p-6 md:border-b border-gray-600/50">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h5 className="text-white font-bold text-lg md:text-3xl">
                                          {taskType}
                                        </h5>
                                      </div>
                                      {groups.length > 3 && (
                                        <button
                                          onClick={() =>
                                            toggleTaskTypeExpanded(vehicle.vehicleRegistration, taskType)
                                          }
                                          className="flex items-center gap-3 text-purple-400 hover:text-purple-300 transition-colors"
                                        >
                                          <span className="text-sm md:text-xl">
                                            {isExpanded
                                              ? `Skryť ${groups.length - 3}`
                                              : `Zobraziť ${groups.length}`}
                                          </span>
                                          {isExpanded ? (
                                            <ChevronUp className="w-6 h-6" />
                                          ) : (
                                            <ChevronDown className="w-6 h-6" />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Task Groups in this type */}
                                  <div className="w-full p-0 md:p-6 space-y-1 md:space-y-4">
                                    {visibleGroups.map((group, index) => {
                                      const isNextTaskGroup =
                                        vehicle.nextTask &&
                                        group.tasks.some((task) => task.id === vehicle.nextTask!.id)

                                      let daysText = ''
                                      if (group.daysRemaining !== null) {
                                        if (group.daysRemaining > 0) {
                                          daysText = `zostáva ${group.daysRemaining} dní`
                                        } else if (group.daysRemaining === 0) {
                                          daysText = 'dnes'
                                        } else {
                                          daysText = `pred ${Math.abs(group.daysRemaining)} dňami`
                                        }
                                      }

                                      const styles = getUrgencyStyles(group.urgencyLevel)

                                      return (
                                        <div
                                          key={`${group.notificationType}-${group.dutyDate}-${index}`}
                                          className={`w-full md:rounded-xl p-3 md:p-6 md:border ${
                                            styles.border
                                          } ${isNextTaskGroup ? 'md:ring-2 ring-yellow-400/50' : ''}`}
                                        >
                                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 md:mb-4">
                                            <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-0">
                                              {isNextTaskGroup && (
                                                <span className="text-yellow-400 text-xs md:text-lg bg-yellow-400/20 px-2 md:px-4 py-1 md:py-2 rounded-lg font-normal">
                                                  NASLEDUJÚCA
                                                </span>
                                              )}
                                              <div>
                                                <h6 className="text-white font-bold text-2xl md:text-2xl">
                                                  1 úloha
                                                </h6>
                                                <p className="text-white text-lg md:text-lg opacity-75">
                                                  Termín: {formatDate(group.dutyDate)}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="text-left md:text-right">
                                              {group.daysRemaining !== null && (
                                                <div>
                                                  <span
                                                    className={`text-xl md:text-2xl font-bold px-3 md:px-4 py-2 md:py-2 rounded-lg ${
                                                      group.daysRemaining <= 10
                                                        ? 'text-red-300 bg-red-400/30'
                                                        : group.daysRemaining <= 30
                                                        ? 'text-orange-300 bg-orange-400/30'
                                                        : 'text-green-400 font-normal bg-green-400/10'
                                                    }`}
                                                  >
                                                    {daysText}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Mobile-simplified task details */}
                                          <div className="space-y-2 md:space-y-3 mt-2 md:mt-4">
                                            <div className="flex items-center gap-1 md:gap-3 flex-wrap">
                                              <span
                                                className={`px-3 md:px-3 py-1 rounded text-lg md:text-lg font-medium ${getTaskStatusColor(
                                                  group.tasks[0].status,
                                                )}`}
                                              >
                                                {group.tasks[0].status}
                                              </span>
                                              {group.tasks.length > 1 && (
                                                <span className="px-3 md:px-3 py-1 bg-purple-600/20 text-purple-300 text-lg md:text-lg rounded">
                                                  {group.tasks.length}x
                                                </span>
                                              )}
                                              {group.tasks.some((task) => task.emailSentAt) && (
                                                <span className="px-3 md:px-3 py-1 bg-blue-600/20 text-blue-300 text-lg md:text-lg rounded">
                                                  📧
                                                </span>
                                              )}
                                              {group.tasks.some((task) => task.smsSentAt) && (
                                                <span className="px-3 md:px-3 py-1 bg-green-600/20 text-green-300 text-lg md:text-lg rounded">
                                                  📱
                                                </span>
                                              )}
                                              {group.tasks.some((task) => task.confirmedAt) && (
                                                <span className="px-3 md:px-3 py-1 bg-green-600/20 text-green-300 text-lg md:text-lg rounded">
                                                  ✓
                                                </span>
                                              )}
                                            </div>

                                            <div className="block md:flex md:items-center md:gap-6 text-lg md:text-lg space-y-1 md:space-y-0">
                                              <div>
                                                <span className="text-gray-400">Kontakt:</span>
                                                <span className="text-white ml-2 md:ml-2 font-medium">
                                                  {group.tasks[0].personName || 'Nedostupné'}
                                                </span>
                                              </div>
                                              <div className="hidden md:block">
                                                <span className="text-gray-400">Email:</span>
                                                <span className="text-white ml-2">
                                                  {group.tasks[0].email || 'Nedostupné'}
                                                </span>
                                              </div>
                                            </div>

                                            <div>
                                              <span className="text-gray-400 text-lg md:text-lg">
                                                Notifikácie:
                                              </span>
                                              <div className="flex flex-wrap gap-2 md:gap-2 mt-1">
                                                {group.tasks
                                                  .sort((a, b) => {
                                                    const dateA = a.notificationDate
                                                      ? new Date(a.notificationDate)
                                                      : new Date(a.createdAt)
                                                    const dateB = b.notificationDate
                                                      ? new Date(b.notificationDate)
                                                      : new Date(b.createdAt)
                                                    return dateA.getTime() - dateB.getTime()
                                                  })
                                                  .map((task) => (
                                                    <span
                                                      key={task.id}
                                                      className="text-white text-lg md:text-lg px-2 md:px-2 py-1 bg-white/10 rounded"
                                                    >
                                                      {task.notificationDate
                                                        ? formatDate(task.notificationDate)
                                                        : 'Bez dátumu'}
                                                    </span>
                                                  ))}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })
                          })()}
                        </div>
                      )}
                    </div>
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

export default VehicleCardsDashboard