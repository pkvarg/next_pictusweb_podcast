'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Car,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'

interface MyVehicle {
  id: string
  image: string | null
  registration: string
  type: string
  organizationRelation?: {
    id: string
    name: string
  } | null
}

interface VehicleNotification {
  id: number
  dutyBatchId: string | null
  myVehicleId: string | null
  vehicleRegistration: string | null
  notificationType: string | null
  dutyDate: string | null
  status: string
  myVehicle?: MyVehicle | null
}

interface DutyInfo {
  date: string
  type: string
  daysUntil: number
}

interface VehicleWithDuty {
  vehicleId: string
  registration: string
  type: string
  image: string | null
  organizationName: string | null
  duties: DutyInfo[]
  nextDutyDate: string | null
  nextDutyType: string | null
  daysUntilNext: number | null
  urgencyLevel: 'green' | 'orange' | 'red' | 'gray'
  totalDuties: number
}

interface SimpleDutyOverviewProps {
  company: string
  organizationName?: string
}

const SimpleDutyOverview = ({ company, organizationName }: SimpleDutyOverviewProps) => {
  const isPictusaciUser = organizationName === 'PICTUSACI'
  const [vehiclesWithDuties, setVehiclesWithDuties] = useState<VehicleWithDuty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch vehicles and notifications
        const [vehiclesResponse, notificationsResponse] = await Promise.all([
          fetch('/api/my-vehicles'),
          fetch(`/api/vehicle-notifications${company ? `?company=${encodeURIComponent(company)}` : ''}`)
        ])

        if (!vehiclesResponse.ok || !notificationsResponse.ok) {
          setVehiclesWithDuties([])
          return
        }

        const vehiclesData = await vehiclesResponse.json()
        const notificationsData = await notificationsResponse.json()

        const vehicles = vehiclesData.vehicles || []
        const notifications = notificationsData.notifications || []

        // Process each vehicle
        const processed: VehicleWithDuty[] = vehicles.map((vehicle: any) => {
          // Get duties for this vehicle (include all statuses)
          const vehicleDuties = notifications.filter(
            (n: VehicleNotification) =>
              (n.myVehicleId === vehicle.id ||
                n.vehicleRegistration?.toLowerCase() === vehicle.registration.toLowerCase()) &&
              n.dutyDate
          )

          console.log(`[SimpleDutyOverview] Vehicle ${vehicle.registration}: ${vehicleDuties.length} duties (all statuses)`)

          // Find next upcoming duty
          const now = new Date()
          now.setHours(0, 0, 0, 0) // Reset to start of day

          // Filter duties within next 2 months (60 days)
          const twoMonthsFromNow = new Date(now)
          twoMonthsFromNow.setDate(twoMonthsFromNow.getDate() + 60)

          const upcomingDuties = vehicleDuties
            .filter((d: VehicleNotification) => {
              const dutyDate = new Date(d.dutyDate!)
              dutyDate.setHours(0, 0, 0, 0) // Reset to start of day
              return dutyDate >= now && dutyDate <= twoMonthsFromNow
            })
            .sort((a: VehicleNotification, b: VehicleNotification) =>
              new Date(a.dutyDate!).getTime() - new Date(b.dutyDate!).getTime()
            )

          console.log(`[SimpleDutyOverview] Vehicle ${vehicle.registration}: ${upcomingDuties.length} upcoming duties (next 60 days)`)

          // Deduplicate notifications by duty date and notification type
          // Keep only one notification per unique combination of (vehicleId, notificationType, dutyDate)
          const deduplicatedDuties = upcomingDuties.reduce((acc: VehicleNotification[], duty) => {
            const key = `${duty.notificationType}-${duty.dutyDate}`
            const exists = acc.some(d => `${d.notificationType}-${d.dutyDate}` === key)
            if (!exists) {
              acc.push(duty)
            }
            return acc
          }, [])

          console.log(`[SimpleDutyOverview] Vehicle ${vehicle.registration}: ${deduplicatedDuties.length} unique duties after deduplication`)

          // Build duty info array
          const duties: DutyInfo[] = deduplicatedDuties.map((duty) => {
            const dutyDate = new Date(duty.dutyDate!)
            dutyDate.setHours(0, 0, 0, 0)
            const timeDiff = dutyDate.getTime() - now.getTime()
            const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24))

            return {
              date: duty.dutyDate!,
              type: duty.notificationType || 'N/A',
              daysUntil,
            }
          })

          const nextDuty = deduplicatedDuties[0] || null
          let daysUntilNext: number | null = null
          let urgencyLevel: 'green' | 'orange' | 'red' | 'gray' = 'gray'

          if (nextDuty && nextDuty.dutyDate) {
            const dutyDate = new Date(nextDuty.dutyDate)
            dutyDate.setHours(0, 0, 0, 0) // Normalize to start of day
            const timeDiff = dutyDate.getTime() - now.getTime()
            daysUntilNext = Math.ceil(timeDiff / (1000 * 3600 * 24))

            if (daysUntilNext <= 7) {
              urgencyLevel = 'red'
            } else if (daysUntilNext <= 30) {
              urgencyLevel = 'orange'
            } else {
              urgencyLevel = 'green'
            }
          }

          return {
            vehicleId: vehicle.id,
            registration: vehicle.registration,
            type: vehicle.type,
            image: vehicle.image,
            organizationName: vehicle.organizationRelation?.name || null,
            duties,
            nextDutyDate: nextDuty?.dutyDate || null,
            nextDutyType: nextDuty?.notificationType || null,
            daysUntilNext,
            urgencyLevel,
            totalDuties: vehicleDuties.length,
          }
        })

        // Sort by urgency
        const urgencyOrder = { red: 0, orange: 1, green: 2, gray: 3 }
        processed.sort((a, b) => {
          if (urgencyOrder[a.urgencyLevel] !== urgencyOrder[b.urgencyLevel]) {
            return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel]
          }
          if (a.daysUntilNext !== null && b.daysUntilNext !== null) {
            return a.daysUntilNext - b.daysUntilNext
          }
          return 0
        })

        console.log('[SimpleDutyOverview] Final processed vehicles:', processed.length)
        console.log('[SimpleDutyOverview] Vehicles with duties:', processed.filter(v => v.nextDutyDate).length)

        setVehiclesWithDuties(processed)
      } catch (error) {
        console.error('Error fetching duty overview:', error)
        setVehiclesWithDuties([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [company])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getUrgencyColor = (urgency: 'green' | 'orange' | 'red' | 'gray') => {
    switch (urgency) {
      case 'red':
        return 'border-red-600'
      case 'orange':
        return 'border-orange-500'
      case 'green':
        return 'border-green-500'
      default:
        return 'border-gray-500'
    }
  }

  const getUrgencyIcon = (urgency: 'green' | 'orange' | 'red' | 'gray') => {
    switch (urgency) {
      case 'red':
        return <AlertTriangle className="w-6 h-6 text-red-400" />
      case 'orange':
        return <Clock className="w-6 h-6 text-orange-400" />
      case 'green':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      default:
        return <Calendar className="w-6 h-6 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pictus-lime"></div>
      </div>
    )
  }

  if (vehiclesWithDuties.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-pictus-white text-xl font-light">Žiadne vozidlá s úlohami</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-8 h-8 text-pictus-lime" />
        <h2 className="text-4xl font-light text-pictus-white">Prehľad nasledujúcich úloh</h2>
      </div>

      {/* Rows of vehicles */}
      <div className="space-y-3">
        {vehiclesWithDuties.map((vehicle) => (
          <div
            key={vehicle.vehicleId}
            className={`bg-gradient-to-r from-pictus-onyx900/50 to-pictus-black/80 rounded-xl p-4 border-l-4 ${getUrgencyColor(vehicle.urgencyLevel)} transition-all hover:shadow-lg`}
          >
            <div className="flex items-center gap-4">
              {/* Urgency indicator */}
              <div className="flex-shrink-0">
                {getUrgencyIcon(vehicle.urgencyLevel)}
              </div>

              {/* Vehicle image */}
              <div className="flex-shrink-0">
                {vehicle.image ? (
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-pictus-black/50">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.registration}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-16 rounded-lg bg-pictus-lime/20 flex items-center justify-center">
                    <Car className="w-8 h-8 text-pictus-lime/50" />
                  </div>
                )}
              </div>

              {/* Vehicle info */}
              <div className="flex-shrink-0 min-w-[120px]">
                <h3 className="text-xl font-light text-pictus-white">{vehicle.registration}</h3>
                <p className="text-sm text-pictus-lime">{vehicle.type}</p>
                {isPictusaciUser && vehicle.organizationName && (
                  <p className="text-xs text-pictus-white/60 mt-1">{vehicle.organizationName}</p>
                )}
              </div>

              {/* Duty info */}
              <div className="flex-1 min-w-0">
                {vehicle.duties.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-pictus-white/70">
                      Nasledujúce úlohy ({vehicle.duties.length}):
                    </p>
                    <div className="space-y-1">
                      {vehicle.duties.map((duty, idx) => (
                        <div key={idx} className="flex items-center gap-4 text-sm">
                          <span className="text-pictus-white font-medium min-w-[140px]">
                            {duty.type}
                          </span>
                          <span className="text-pictus-lime">
                            {formatDate(duty.date)}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            duty.daysUntil === 0
                              ? 'bg-red-700/30 text-red-400'
                              : duty.daysUntil <= 7
                              ? 'bg-red-700/30 text-red-400'
                              : duty.daysUntil <= 30
                              ? 'bg-orange-600/30 text-orange-400'
                              : 'bg-green-600/30 text-green-400'
                          }`}>
                            {duty.daysUntil === 0
                              ? 'Dnes'
                              : duty.daysUntil === 1
                              ? 'Zajtra'
                              : `${duty.daysUntil}d`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400/50" />
                    <p className="text-sm text-pictus-white/50">Žiadne úlohy (ďalších 60 dní)</p>
                  </div>
                )}
              </div>

              {/* Duty count badge */}
              {vehicle.duties.length > 0 && (
                <div className="flex-shrink-0">
                  <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                    vehicle.urgencyLevel === 'red'
                      ? 'text-red-400 bg-red-700/30'
                      : vehicle.urgencyLevel === 'orange'
                      ? 'text-orange-400 bg-orange-600/30'
                      : 'text-green-400 bg-green-600/30'
                  }`}>
                    {vehicle.daysUntilNext === 0
                      ? 'Dnes!'
                      : vehicle.daysUntilNext === 1
                      ? 'Zajtra!'
                      : `${vehicle.daysUntilNext}d`}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SimpleDutyOverview
