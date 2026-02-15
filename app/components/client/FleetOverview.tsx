'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import {
  Car,
  Calendar,
  Gauge,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowRight,
  Receipt,
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { FaEuroSign } from 'react-icons/fa'

type ExpenseFilter = 'all' | 'thisMonth' | 'thisYear'
type DutyFilter = 'all' | 'thisMonth' | 'thisYear'

interface MyVehicleExpense {
  id: string
  item: string
  cost: number
  date: string
  createdAt: string
}

interface MyVehicleMileage {
  id: string
  kilometers: number
  date: string
  note: string | null
  createdAt: string
}

interface VehicleNotification {
  id: number
  organizationId: string | null
  organization?: {
    id: string
    name: string
  }
  personName: string | null
  email: string | null
  phoneNumber: string | null
  vehicleRegistration: string | null
  myVehicleId: string | null
  notificationType: string | null
  notificationChannel: string | null
  notificationDate: string | null
  dutyDate: string | null
  emailMessage: string | null
  status: string
  emailSentAt: string | null
  smsSentAt: string | null
  confirmedAt: string | null
  createdAt: string
}

interface MyVehicle {
  id: string
  organization: string
  organizationRelation?: {
    id: string
    name: string
  }
  type: string
  registration: string
  year: number | null
  image: string | null
  note: string | null
  createdAt: string
  updatedAt: string
  expenses: MyVehicleExpense[]
  mileageRecords: MyVehicleMileage[]
}

interface FleetOverviewProps {
  userId?: string
  organization?: string
  organizationName?: string
  isFleetManager?: boolean
}

const FleetOverview = ({ userId, organization, organizationName, isFleetManager = false }: FleetOverviewProps) => {
  const isPictusaciUser = organizationName === 'PICTUSACI'
  const [vehicles, setVehicles] = useState<MyVehicle[]>([])
  const [notifications, setNotifications] = useState<VehicleNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expenseFilters, setExpenseFilters] = useState<Record<string, ExpenseFilter>>({})
  const [dutyFilters, setDutyFilters] = useState<Record<string, DutyFilter>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        // Fetch vehicles - pass organization if provided
        const vehiclesUrl = organization
          ? `/api/my-vehicles?organization=${encodeURIComponent(organization)}`
          : '/api/my-vehicles'
        const vehiclesResponse = await fetch(vehiclesUrl)

        if (vehiclesResponse.status === 403) {
          setError('Prístup zamietnutý - vyžaduje sa oprávnenie správcu flotily')
          return
        }

        if (!vehiclesResponse.ok) {
          setVehicles([])
          return
        }

        const vehiclesData = await vehiclesResponse.json()
        console.log(`Fetched ${vehiclesData.vehicles?.length || 0} vehicles for organization: ${organization || 'current user'}`)
        setVehicles(vehiclesData.vehicles || [])

        // Fetch notifications - pass organization to get relevant notifications
        try {
          const notificationsUrl = organization
            ? `/api/vehicle-notifications?company=${encodeURIComponent(organization)}`
            : '/api/vehicle-notifications'
          const notificationsResponse = await fetch(notificationsUrl)
          if (notificationsResponse.ok) {
            const notificationsData = await notificationsResponse.json()
            const fetchedNotifications = notificationsData.notifications || []
            console.log('Fetched notifications:', fetchedNotifications.length)
            console.log('Sample notification:', fetchedNotifications[0])

            // Check for the specific vehicle
            const vehicle2029Notifs = fetchedNotifications.filter(
              (n: VehicleNotification) => n.myVehicleId === 'd6382b41-1455-4441-92e7-775c63bbecc6'
            )
            if (vehicle2029Notifs.length > 0) {
              console.log(`🔍 Found ${vehicle2029Notifs.length} notifications for vehicle d6382b41-1455-4441-92e7-775c63bbecc6`)
              console.log('Duty dates:', vehicle2029Notifs.map((n: VehicleNotification) => n.dutyDate).sort())
            }

            setNotifications(fetchedNotifications)
          }
        } catch (err) {
          console.error('Error fetching notifications:', err)
          setNotifications([])
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err)
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const getLatestMileage = (mileageRecords: MyVehicleMileage[]) => {
    if (mileageRecords.length === 0) return null
    return mileageRecords[0]
  }

  const filterExpenses = (expenses: MyVehicleExpense[], filter: ExpenseFilter) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    switch (filter) {
      case 'thisMonth':
        return expenses.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return (
            expenseDate.getFullYear() === currentYear &&
            expenseDate.getMonth() === currentMonth
          )
        })
      case 'thisYear':
        return expenses.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return expenseDate.getFullYear() === currentYear
        })
      case 'all':
      default:
        return expenses
    }
  }

  const getTotalExpenses = (expenses: MyVehicleExpense[], filter: ExpenseFilter = 'all') => {
    const filtered = filterExpenses(expenses, filter)
    return filtered.reduce((sum, expense) => sum + Number(expense.cost), 0)
  }

  const getRecentExpenses = (expenses: MyVehicleExpense[], filter: ExpenseFilter, count: number = 3) => {
    const filtered = filterExpenses(expenses, filter)
    return filtered.slice(0, count)
  }

  const setVehicleExpenseFilter = (vehicleId: string, filter: ExpenseFilter) => {
    setExpenseFilters((prev) => ({
      ...prev,
      [vehicleId]: filter,
    }))
  }

  const setVehicleDutyFilter = (vehicleId: string, filter: DutyFilter) => {
    setDutyFilters((prev) => ({
      ...prev,
      [vehicleId]: filter,
    }))
  }

  const filterDuties = (duties: VehicleNotification[], filter: DutyFilter) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    switch (filter) {
      case 'thisMonth':
        return duties.filter((duty) => {
          if (!duty.dutyDate) return false
          const dutyDate = new Date(duty.dutyDate)
          return (
            dutyDate.getFullYear() === currentYear &&
            dutyDate.getMonth() === currentMonth
          )
        })
      case 'thisYear':
        return duties.filter((duty) => {
          if (!duty.dutyDate) return false
          const dutyDate = new Date(duty.dutyDate)
          return dutyDate.getFullYear() === currentYear
        })
      case 'all':
      default:
        return duties
    }
  }

  interface GroupedDuty {
    notificationType: string | null
    dutyDate: string
    notifications: VehicleNotification[]
    latestStatus: string
  }

  const getVehicleDuties = (vehicleId: string, vehicleRegistration: string, filter: DutyFilter = 'all'): GroupedDuty[] => {
    // Filter by myVehicleId first, or fall back to matching by vehicleRegistration
    // Don't filter by status here - we want to show all duties even if they only have "imported" notifications
    const vehicleDuties = notifications.filter(
      (notification) => {
        const hasValidDutyDate = notification.dutyDate
        const matchesById = notification.myVehicleId === vehicleId
        const matchesByRegistration = notification.vehicleRegistration?.toLowerCase() === vehicleRegistration.toLowerCase()

        return hasValidDutyDate && (matchesById || matchesByRegistration)
      }
    )

    if (vehicleDuties.length > 0) {
      console.log(`Found ${vehicleDuties.length} raw duties for vehicle ${vehicleRegistration} (ID: ${vehicleId})`)
      console.log('Duty dates:', vehicleDuties.map(d => d.dutyDate).sort())

      // Check if vehicle ID matches the one mentioned
      if (vehicleId === 'd6382b41-1455-4441-92e7-775c63bbecc6') {
        console.log('🔍 Found special vehicle d6382b41-1455-4441-92e7-775c63bbecc6')
        console.log('All duty dates for this vehicle:', vehicleDuties.map(d => ({
          id: d.id,
          dutyDate: d.dutyDate,
          type: d.notificationType,
          status: d.status
        })))
      }
    }

    const filtered = filterDuties(vehicleDuties, filter)

    // Group by notificationType + dutyDate
    const grouped = new Map<string, GroupedDuty>()

    filtered.forEach((notification) => {
      const key = `${notification.notificationType || 'unknown'}-${notification.dutyDate}`

      if (!grouped.has(key)) {
        grouped.set(key, {
          notificationType: notification.notificationType,
          dutyDate: notification.dutyDate!,
          notifications: [notification],
          latestStatus: notification.status,
        })
      } else {
        const existing = grouped.get(key)!
        existing.notifications.push(notification)
        // Update to latest status (prioritize: confirmed > reminded > sent > no_response > pending > imported)
        const statusPriority: Record<string, number> = {
          confirmed: 6,
          reminded: 5,
          reminded1: 5,
          reminded2: 5,
          sent: 4,
          no_response: 3,
          pending: 2,
          failed: 1,
          imported: 0, // Lowest priority
        }
        const currentPriority = statusPriority[existing.latestStatus.toLowerCase()] || 0
        const newPriority = statusPriority[notification.status.toLowerCase()] || 0
        if (newPriority > currentPriority) {
          existing.latestStatus = notification.status
        }
      }
    })

    // Sort grouped duties by duty date ascending
    const sortedGrouped = Array.from(grouped.values()).sort((a, b) => {
      return new Date(a.dutyDate).getTime() - new Date(b.dutyDate).getTime()
    })

    console.log(`After grouping and filtering (${filter}): ${sortedGrouped.length} grouped duties`)
    if (sortedGrouped.length > 0) {
      console.log('Grouped duty dates:', sortedGrouped.map(d => d.dutyDate))
    }

    return sortedGrouped
  }

  const getNextDuty = (vehicleId: string, vehicleRegistration: string) => {
    const now = new Date()
    const duties = getVehicleDuties(vehicleId, vehicleRegistration, 'all')
    return duties.find((duty) => {
      return new Date(duty.dutyDate) >= now
    })
  }

  const translateStatus = (status: string): string => {
    const statusLower = status.toLowerCase()

    // Handle reminded variants
    if (statusLower.startsWith('reminded')) {
      return 'Pripomenuté'
    }

    switch (statusLower) {
      case 'confirmed':
        return 'Potvrdené'
      case 'sent':
        return 'Odoslané'
      case 'imported':
        return 'Importované'
      case 'no_response':
        return 'Bez odpovede'
      case 'pending':
        return 'Čaká'
      case 'failed':
        return 'Zlyhalo'
      default:
        return status
    }
  }

  const getDutyStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()

    if (statusLower === 'confirmed') {
      return 'text-green-400 bg-green-500/20 border border-green-500/30'
    }
    if (statusLower === 'pending') {
      return 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30'
    }
    if (statusLower === 'failed') {
      return 'text-red-400 bg-red-700/30 border border-red-600/50'
    }
    if (statusLower.startsWith('reminded')) {
      return 'text-blue-400 bg-blue-500/20 border border-blue-500/30'
    }
    if (statusLower === 'sent') {
      return 'text-green-400 bg-green-500/20 border border-green-500/30'
    }
    if (statusLower === 'imported') {
      return 'text-purple-400 bg-purple-500/20 border border-purple-500/30'
    }
    if (statusLower === 'no_response') {
      return 'text-orange-500 bg-orange-600/30 border border-orange-500/40'
    }

    return 'text-gray-400 bg-gray-500/20 border border-gray-500/30'
  }

  const getDaysUntilDuty = (dutyDate: string) => {
    const now = new Date()
    const duty = new Date(dutyDate)
    const timeDiff = duty.getTime() - now.getTime()
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return days
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pictus-lime"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-200 text-xl">{error}</p>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-2xl p-8 border border-pictus-lime/30 text-center">
        <div className="max-w-xl mx-auto">
          <div className="p-4 bg-pictus-lime/20 rounded-xl inline-block mb-4">
            <Car className="w-12 h-12 text-pictus-lime" />
          </div>
          <h2 className="text-3xl font-light text-pictus-white mb-3">Vaša flotila je prázdna</h2>
          <p className="text-lg text-pictus-lime mb-6">
            {isFleetManager
              ? 'Začnite pridaním prvého vozidla do vašej flotily a sledujte všetky dôležité údaje na jednom mieste.'
              : 'Momentálne nemáte žiadne vozidlá priradené k vašej organizácii.'
            }
          </p>
          {isFleetManager && (
            <Link
              href="/client/my-fleet"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black px-6 py-3 rounded-lg font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all text-lg shadow-lg hover:shadow-pictus-lime/50"
            >
              <Plus size={20} />
              Spravovať flotilu
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-xl">
            <Car className="w-8 h-8 text-pictus-black" />
          </div>
          <div>
            <h2 className="text-4xl font-light text-pictus-white">Vaša flotila</h2>
            <p className="text-xl text-pictus-lime mt-1">
              {vehicles.length} {vehicles.length === 1 ? 'vozidlo' : vehicles.length < 5 ? 'vozidlá' : 'vozidiel'}
            </p>
          </div>
        </div>
        {isFleetManager && (
          <Link
            href="/client/my-fleet"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pictus-lime600 to-pictus-lime600 text-pictus-white px-5 py-2.5 rounded-lg font-normal hover:from-pictus-lime700 hover:to-pictus-black transition-all text-base shadow-lg"
          >
            <Car size={18} />
            Spravovať
            <ArrowRight size={18} />
          </Link>
        )}
      </div>

      {/* Vehicle Cards Grid */}
      <div className={`grid gap-6 ${vehicles.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
        {vehicles.map((vehicle) => {
          const expenseFilter = expenseFilters[vehicle.id] || 'all'
          const dutyFilter = dutyFilters[vehicle.id] || 'all'
          const latestMileage = getLatestMileage(vehicle.mileageRecords)
          const totalExpenses = getTotalExpenses(vehicle.expenses, expenseFilter)
          const recentExpenses = getRecentExpenses(vehicle.expenses, expenseFilter, 2)
          const vehicleDuties = getVehicleDuties(vehicle.id, vehicle.registration, dutyFilter)
          const nextDuty = getNextDuty(vehicle.id, vehicle.registration)

          console.log(`Vehicle: ${vehicle.registration}, ID: ${vehicle.id}, Grouped duties: ${vehicleDuties.length}`)

          return (
            <div
              key={vehicle.id}
              className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 rounded-2xl overflow-hidden border border-pictus-lime/30 hover:border-pictus-lime/50 transition-all shadow-xl"
            >
              {/* Vehicle Image */}
              {vehicle.image ? (
                <div className="relative w-full h-48 bg-pictus-black/50 overflow-hidden">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.registration}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pictus-black via-transparent to-transparent" />

                  {/* Registration Badge on Image */}
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-2xl font-light text-pictus-white bg-pictus-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      {vehicle.registration}
                    </h3>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-48 bg-gradient-to-br from-pictus-lime/20 to-pictus-lime600/20 flex items-center justify-center">
                  <Car className="w-16 h-16 text-pictus-lime/50" />
                  <div className="absolute bottom-3 left-3">
                    <h3 className="text-2xl font-light text-pictus-white bg-pictus-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                      {vehicle.registration}
                    </h3>
                  </div>
                </div>
              )}

              {/* Vehicle Info */}
              <div className="p-4 space-y-4">
                {/* Type and Year */}
                <div>
                  <p className="text-xl text-pictus-lime font-normal">{vehicle.type}</p>
                  {vehicle.year && (
                    <div className="flex items-center gap-2 mt-1 text-pictus-white/70">
                      <Calendar size={14} />
                      <span className="text-sm">Rok: {vehicle.year}</span>
                    </div>
                  )}
                  {isPictusaciUser && vehicle.organizationRelation?.name && (
                    <p className="text-sm text-pictus-white/60 mt-1">{vehicle.organizationRelation.name}</p>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Latest Mileage */}
                  <div className="bg-pictus-white/5 border border-pictus-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Gauge size={16} className="text-blue-400" />
                      <span className="text-xs text-pictus-white/70">Posledný stav</span>
                    </div>
                    {latestMileage ? (
                      <>
                        <p className="text-2xl font-light text-pictus-white">
                          {latestMileage.kilometers.toLocaleString()}
                        </p>
                        <p className="text-xs text-pictus-white/50">km</p>
                        <p className="text-xs text-pictus-lime mt-0.5">
                          {formatDate(latestMileage.date)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-pictus-white/50">Žiadne údaje</p>
                    )}
                  </div>

                  {/* Total Expenses */}
                  <div className="bg-pictus-white/5 border border-pictus-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FaEuroSign size={14} className="text-green-400" />
                      <span className="text-xs text-pictus-white/70">Náklady</span>
                    </div>
                    <p className="text-2xl font-light text-pictus-white">
                      {formatCurrency(totalExpenses)}
                    </p>
                    <p className="text-xs text-pictus-white/50">
                      {filterExpenses(vehicle.expenses, expenseFilter).length} {filterExpenses(vehicle.expenses, expenseFilter).length === 1 ? 'záznam' : 'záznamov'}
                    </p>
                  </div>
                </div>

                {/* Expense Filter Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setVehicleExpenseFilter(vehicle.id, 'all')}
                    className={`flex-1 px-2 py-1.5 rounded text-xs transition-all flex items-center justify-center gap-1 ${
                      expenseFilter === 'all'
                        ? 'bg-pictus-lime text-pictus-black font-medium'
                        : 'bg-pictus-white/5 text-pictus-white/70 hover:bg-pictus-white/10'
                    }`}
                  >
                    <FaEuroSign size={10} />
                    Celkovo
                  </button>
                  <button
                    onClick={() => setVehicleExpenseFilter(vehicle.id, 'thisYear')}
                    className={`flex-1 px-2 py-1.5 rounded text-xs transition-all flex items-center justify-center gap-1 ${
                      expenseFilter === 'thisYear'
                        ? 'bg-pictus-lime text-pictus-black font-medium'
                        : 'bg-pictus-white/5 text-pictus-white/70 hover:bg-pictus-white/10'
                    }`}
                  >
                    <FaEuroSign size={10} />
                    Tento rok
                  </button>
                  <button
                    onClick={() => setVehicleExpenseFilter(vehicle.id, 'thisMonth')}
                    className={`flex-1 px-2 py-1.5 rounded text-xs transition-all flex items-center justify-center gap-1 ${
                      expenseFilter === 'thisMonth'
                        ? 'bg-pictus-lime text-pictus-black font-medium'
                        : 'bg-pictus-white/5 text-pictus-white/70 hover:bg-pictus-white/10'
                    }`}
                  >
                    <FaEuroSign size={10} />
                    Tento mesiac
                  </button>
                </div>

                {/* Recent Expenses */}
                {recentExpenses.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <FaEuroSign size={12} className="text-pictus-lime" />
                      <h4 className="text-sm font-normal text-pictus-white">Posledné výdavky</h4>
                    </div>
                    <div className="space-y-1.5">
                      {recentExpenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between bg-pictus-white/5 rounded-lg p-2"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-pictus-white truncate">{expense.item}</p>
                            <p className="text-xs text-pictus-white/50">{formatDate(expense.date)}</p>
                          </div>
                          <p className="text-xs font-normal text-pictus-lime ml-2">
                            {formatCurrency(Number(expense.cost))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Duties Section */}
                <div className="pt-4 border-t border-pictus-white/10">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Bell size={12} className="text-orange-400" />
                    <h4 className="text-sm font-normal text-pictus-white">Úlohy</h4>
                  </div>

                  {/* Duty Filter Buttons */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setVehicleDutyFilter(vehicle.id, 'all')}
                      className={`flex-1 px-2 py-1.5 rounded text-xs transition-all ${
                        dutyFilter === 'all'
                          ? 'bg-orange-400 text-pictus-black font-medium'
                          : 'bg-pictus-white/5 text-pictus-white/70 hover:bg-pictus-white/10'
                      }`}
                    >
                      Všetky
                    </button>
                    <button
                      onClick={() => setVehicleDutyFilter(vehicle.id, 'thisYear')}
                      className={`flex-1 px-2 py-1.5 rounded text-xs transition-all ${
                        dutyFilter === 'thisYear'
                          ? 'bg-orange-400 text-pictus-black font-medium'
                          : 'bg-pictus-white/5 text-pictus-white/70 hover:bg-pictus-white/10'
                      }`}
                    >
                      Tento rok
                    </button>
                    <button
                      onClick={() => setVehicleDutyFilter(vehicle.id, 'thisMonth')}
                      className={`flex-1 px-2 py-1.5 rounded text-xs transition-all ${
                        dutyFilter === 'thisMonth'
                          ? 'bg-orange-400 text-pictus-black font-medium'
                          : 'bg-pictus-white/5 text-pictus-white/70 hover:bg-pictus-white/10'
                      }`}
                    >
                      Tento mesiac
                    </button>
                  </div>

                  {/* Next Duty Highlight */}
                  {nextDuty && (
                    <div className="mb-2 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-orange-400 font-medium mb-1">Nasledujúca úloha</p>
                          <p className="text-base font-medium text-pictus-white truncate">{nextDuty.notificationType || 'Bez názvu'}</p>
                          <p className="text-sm text-pictus-white mb-1.5">Termín: <span className="font-medium">{formatDate(nextDuty.dutyDate)}</span></p>
                          {/* Notification dates */}
                          <div className="flex flex-wrap gap-1">
                            {nextDuty.notifications
                              .sort((a, b) => {
                                const dateA = a.notificationDate ? new Date(a.notificationDate) : new Date(0)
                                const dateB = b.notificationDate ? new Date(b.notificationDate) : new Date(0)
                                return dateA.getTime() - dateB.getTime()
                              })
                              .map((notif, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs px-1.5 py-0.5 rounded ${getDutyStatusColor(notif.status)}`}
                                >
                                  {notif.notificationDate ? formatDate(notif.notificationDate) : 'N/A'}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          {(() => {
                            const days = getDaysUntilDuty(nextDuty.dutyDate)
                            const isUrgent = days <= 7
                            return (
                              <div className={`text-base font-bold px-3 py-1.5 rounded whitespace-nowrap ${
                                isUrgent ? 'bg-red-700/40 text-red-400 border border-red-600/50' : 'bg-orange-500/20 text-orange-400'
                              }`}>
                                {days === 0 ? 'Dnes!' : days < 0 ? `${Math.abs(days)}d po` : `${days}d`}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Duties List - skip first one as it's shown in "Nasledujúca úloha" */}
                  {vehicleDuties.length > 1 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {vehicleDuties.slice(1, dutyFilter === 'all' ? 11 : 4).map((duty, idx) => {
                        const days = getDaysUntilDuty(duty.dutyDate)
                        return (
                          <div
                            key={idx}
                            className="bg-pictus-white/5 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-base font-medium text-pictus-white truncate">{duty.notificationType || 'Bez názvu'}</p>
                                <p className="text-sm text-pictus-white mt-1">Termín: <span className="font-medium">{formatDate(duty.dutyDate)}</span></p>
                              </div>
                              <div className="text-base font-bold text-pictus-white ml-3 whitespace-nowrap">
                                {days === 0 ? 'Dnes' : days < 0 ? `${Math.abs(days)}d po` : `${days}d`}
                              </div>
                            </div>
                            {/* Notification dates with statuses */}
                            <div className="flex flex-wrap gap-1">
                              {duty.notifications
                                .sort((a, b) => {
                                  const dateA = a.notificationDate ? new Date(a.notificationDate) : new Date(0)
                                  const dateB = b.notificationDate ? new Date(b.notificationDate) : new Date(0)
                                  return dateA.getTime() - dateB.getTime()
                                })
                                .map((notif, notifIdx) => (
                                  <span
                                    key={notifIdx}
                                    className={`text-xs px-1.5 py-0.5 rounded ${getDutyStatusColor(notif.status)}`}
                                    title={translateStatus(notif.status)}
                                  >
                                    {notif.notificationDate ? formatDate(notif.notificationDate) : 'N/A'}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )
                      })}
                      {(() => {
                        const maxShown = dutyFilter === 'all' ? 10 : 3
                        const remaining = vehicleDuties.length - 1 - maxShown // -1 because first duty is shown separately
                        return remaining > 0 ? (
                          <p className="text-xs text-pictus-white/50 text-center pt-1">
                            +{remaining} ďalších
                          </p>
                        ) : null
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <CheckCircle className="w-8 h-8 text-green-400/50 mx-auto mb-1" />
                      <p className="text-xs text-pictus-white/50">Žiadne úlohy</p>
                    </div>
                  )}
                </div>

                {/* Note */}
                {vehicle.note && (
                  <div className="pt-3 border-t border-pictus-white/10">
                    <p className="text-xs text-pictus-white/70 italic line-clamp-2">{vehicle.note}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FleetOverview
