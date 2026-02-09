'use client'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import {
  User,
  UserCheck,
  LogOut,
  Car,
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  ShieldAlert,
  Gauge,
  Bell,
  Users,
  Settings,
  Building,
  Copy,
} from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import ExpensesModal from '@/app/components/client/ExpensesModal'
import MileageModal from '@/app/components/client/MileageModal'
import FleetManagerUserModal from '@/app/components/client/FleetManagerUserModal'
import NotificationBuilder from '@/app/components/admin/NotificationBuilder'
import NotificationSettings from '@/app/components/admin/NotificationSettings'
import { FaEuroSign } from 'react-icons/fa'

interface MyVehicle {
  id: string
  organization: string
  type: string
  registration: string
  year: number | null
  image: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

interface Organization {
  id: string
  name: string
  tier: string | null
  numberUsers: number | null
  numberVehicles: number | null
  numberNotificationTypes: number | null
}

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  organization: string | null
  active: boolean
  isFleetManager: boolean
  role: string
  createdAt: string
}

interface VehicleNotification {
  id: number
  company: string | null
  personName: string | null
  email: string | null
  phoneNumber: string | null
  vehicleRegistration: string | null
  vehicleType: string | null
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

type TabType = 'vehicles' | 'users' | 'notifications' | 'settings'

const MyFleetPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('Client')
  const [vehicles, setVehicles] = useState<MyVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expensesModalOpen, setExpensesModalOpen] = useState(false)
  const [mileageModalOpen, setMileageModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<MyVehicle | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('vehicles')
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [orgLoading, setOrgLoading] = useState(false)

  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Notifications state
  const [showNotificationBuilder, setShowNotificationBuilder] = useState(false)
  const [notifications, setNotifications] = useState<VehicleNotification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [duplicateNotificationData, setDuplicateNotificationData] = useState<VehicleNotification | null>(null)

  // Notification filters
  const [filterVehicle, setFilterVehicle] = useState('')
  const [filterPerson, setFilterPerson] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterDatePreset, setFilterDatePreset] = useState<'all' | 'thisMonth' | 'thisYear' | 'custom'>('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  // Define fetch functions with useCallback before useEffect
  const fetchOrganization = useCallback(async () => {
    if (!session?.user?.organization) return

    try {
      setOrgLoading(true)
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const data = await response.json()
        const orgs = data.organizations || []
        const userOrg = orgs.find((org: Organization) =>
          org.name.toLowerCase() === session.user.organization?.toLowerCase()
        )
        if (userOrg) {
          setOrganization(userOrg)
        }
      }
    } catch (err) {
      console.error('Error fetching organization:', err)
    } finally {
      setOrgLoading(false)
    }
  }, [session?.user?.organization])

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/my-vehicles')

      if (response.status === 403) {
        setError('Prístup zamietnutý - vyžaduje sa oprávnenie správcu flotily')
        return
      }

      if (!response.ok) {
        // Just show empty state instead of error
        setVehicles([])
        return
      }

      const data = await response.json()
      setVehicles(data.vehicles || [])
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      // Show empty state instead of error message
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    if (!session?.user?.organization) return

    try {
      setUsersLoading(true)
      const response = await fetch(`/api/users?organization=${encodeURIComponent(session.user.organization)}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setUsers([])
    } finally {
      setUsersLoading(false)
    }
  }, [session?.user?.organization])

  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.organization) return

    try {
      setNotificationsLoading(true)
      const response = await fetch('/api/vehicle-notifications')
      if (response.ok) {
        const data = await response.json()
        const allNotifications = Array.isArray(data.notifications) ? data.notifications : []
        // Filter by organization
        const orgNotifications = allNotifications.filter(
          (n: VehicleNotification) =>
            n.company?.toLowerCase() === session.user.organization?.toLowerCase()
        )
        setNotifications(orgNotifications)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setNotifications([])
    } finally {
      setNotificationsLoading(false)
    }
  }, [session?.user?.organization])

  useEffect(() => {
    // Check if user is authenticated and is fleet manager
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/login')
      return
    }

    if (!session.user.isFleetManager) {
      // Not a fleet manager, redirect back to client page
      router.push('/client')
      return
    }

    // Fetch vehicles and organization
    fetchVehicles()
    fetchOrganization()
    fetchUsers()
    fetchNotifications()
  }, [session, status, router, fetchVehicles, fetchOrganization, fetchUsers, fetchNotifications])

  const handleDelete = async (id: string) => {
    if (!confirm('Naozaj chcete odstrániť toto vozidlo?')) {
      return
    }

    try {
      const response = await fetch(`/api/my-vehicles/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete vehicle')
      }

      // Refresh the list
      fetchVehicles()
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      alert('Nepodarilo sa odstrániť vozidlo')
    }
  }

  const handleDeleteNotification = async (id: number) => {
    if (!confirm('Naozaj chcete odstrániť túto notifikáciu?')) {
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
      alert('Nepodarilo sa odstrániť notifikáciu')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    // Prevent deleting yourself
    if (session?.user?.id === userId) {
      alert('Nemôžete odstrániť seba')
      return
    }

    if (!confirm('Naozaj chcete odstrániť tohto používateľa?')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      fetchUsers()
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('Nepodarilo sa odstrániť používateľa')
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setUserModalOpen(true)
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setUserModalOpen(true)
  }

  const handleUserModalSuccess = () => {
    fetchUsers()
    setUserModalOpen(false)
    setEditingUser(null)
  }

  // Show loading while checking authentication
  if (status === 'loading' || (session && loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-black text-pictus-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pictus-lime"></div>
      </div>
    )
  }

  // Show access denied if not fleet manager
  if (session && !session.user.isFleetManager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-black text-pictus-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-3xl font-light mb-4">Prístup zamietnutý</h2>
          <p className="text-pictus-lime mb-6">
            Na prístup k správe flotily potrebujete oprávnenie správcu flotily.
          </p>
          <Link
            href="/client"
            className="inline-flex items-center gap-2 bg-pictus-lime600 text-pictus-white px-6 py-3 rounded-lg hover:bg-pictus-lime700 transition"
          >
            <ArrowLeft size={20} />
            Späť na dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Vehicle filter
    if (filterVehicle && notification.vehicleRegistration !== filterVehicle) {
      return false
    }

    // Person filter
    if (filterPerson && (!notification.personName || !notification.personName.toLowerCase().includes(filterPerson.toLowerCase()))) {
      return false
    }

    // Type filter
    if (filterType && notification.notificationType !== filterType) {
      return false
    }

    // Date filter
    if (filterDatePreset !== 'all' && notification.notificationDate) {
      const notificationDate = new Date(notification.notificationDate)
      const now = new Date()

      if (filterDatePreset === 'thisMonth') {
        if (notificationDate.getMonth() !== now.getMonth() || notificationDate.getFullYear() !== now.getFullYear()) {
          return false
        }
      } else if (filterDatePreset === 'thisYear') {
        if (notificationDate.getFullYear() !== now.getFullYear()) {
          return false
        }
      } else if (filterDatePreset === 'custom') {
        if (filterDateFrom) {
          const fromDate = new Date(filterDateFrom)
          if (notificationDate < fromDate) {
            return false
          }
        }
        if (filterDateTo) {
          const toDate = new Date(filterDateTo)
          toDate.setHours(23, 59, 59, 999) // Include the entire end date
          if (notificationDate > toDate) {
            return false
          }
        }
      }
    }

    return true
  })

  // Get unique values for filter dropdowns
  const uniqueVehicles = Array.from(new Set(notifications.map(n => n.vehicleRegistration).filter(Boolean)))
  const uniqueTypes = Array.from(new Set(notifications.map(n => n.notificationType).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white font-brutal-milk">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-pictus-lime/30 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 text-pictus-white">
                <div className="w-8 h-8 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-lg flex items-center justify-center">
                  <UserCheck size={18} className="text-pictus-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-light">Pictusweb</h1>
                  <p className="text-lg text-pictus-lime hidden sm:block">FleetSync</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-pictus-white">
                <User size={16} />
                <span className="text-lg">{session?.user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-lg text-pictus-white hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('logOut')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/client"
            className="inline-flex items-center gap-2 text-pictus-lime hover:text-pictus-lime-200 transition-colors text-lg"
          >
            <ArrowLeft size={20} />
            Späť na dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-pictus-lime600/20 to-pictus-lime600/20 rounded-xl">
              <Car className="w-10 h-10 text-pictus-lime" />
            </div>
            <div>
              <h1 className="text-5xl font-light text-pictus-white">FleetSync Manager</h1>
              {organization && (
                <p className="text-2xl text-pictus-lime flex items-center gap-2">
                  <Building size={20} />
                  {organization.name}
                  {organization.tier && (
                    <span className="text-sm bg-pictus-lime/20 px-2 py-1 rounded">
                      {organization.tier}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-white/10">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex items-center gap-2 px-4 py-3 text-lg font-light transition-all ${
                activeTab === 'vehicles'
                  ? 'text-pictus-lime border-b-2 border-pictus-lime'
                  : 'text-gray-400 hover:text-pictus-white'
              }`}
            >
              <Car size={20} />
              Vozidlá ({vehicles.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-3 text-lg font-light transition-all ${
                activeTab === 'users'
                  ? 'text-pictus-lime border-b-2 border-pictus-lime'
                  : 'text-gray-400 hover:text-pictus-white'
              }`}
            >
              <Users size={20} />
              Používatelia
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-4 py-3 text-lg font-light transition-all ${
                activeTab === 'notifications'
                  ? 'text-pictus-lime border-b-2 border-pictus-lime'
                  : 'text-gray-400 hover:text-pictus-white'
              }`}
            >
              <Bell size={20} />
              Notifikácie
            </button>
            {organization?.tier === 'Business' && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-3 text-lg font-light transition-all ${
                  activeTab === 'settings'
                    ? 'text-pictus-lime border-b-2 border-pictus-lime'
                    : 'text-gray-400 hover:text-pictus-white'
                }`}
              >
                <Settings size={20} />
                Nastavenia
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'vehicles' && (
          <>
            {/* Vehicle Header Actions */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                {organization?.numberVehicles && (
                  <p className="text-sm text-gray-400">
                    Počet vozidiel: {vehicles.length} / {organization.numberVehicles}
                    {vehicles.length >= organization.numberVehicles && (
                      <span className="ml-2 text-orange-400">(Limit dosiahnutý)</span>
                    )}
                  </p>
                )}
              </div>
              <Link
                href="/client/my-fleet/new"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-light transition-all text-lg ${
                  organization?.numberVehicles && vehicles.length >= organization.numberVehicles
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pictus-lime600 to-pictus-lime600 text-pictus-white hover:from-pictus-lime700 hover:to-pictus-black'
                }`}
                onClick={(e) => {
                  if (organization?.numberVehicles && vehicles.length >= organization.numberVehicles) {
                    e.preventDefault()
                    alert('Dosiahli ste maximálny počet vozidiel pre vašu organizáciu')
                  }
                }}
              >
                <Plus size={20} />
                Pridať vozidlo
              </Link>
            </div>

            {/* Vehicles Grid */}
            {vehicles.length === 0 ? (
          // Empty State
          <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-3xl p-12 border border-pictus-lime/30 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="p-6 bg-pictus-lime/20 rounded-2xl inline-block mb-6">
                <Car className="w-16 h-16 text-pictus-black" />
              </div>
              <h2 className="text-4xl font-light text-pictus-white mb-4">Žiadne vozidlá</h2>
              <p className="text-xl text-pictus-lime mb-8">
                Začnite pridaním prvého vozidla do vašej flotily.
              </p>
              <Link
                href="/client/my-fleet/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black px-8 py-4 rounded-lg font-light hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all text-xl shadow-lg hover:shadow-pictus-lime/50"
              >
                <Plus size={24} />
                Pridať prvé vozidlo
              </Link>
            </div>
          </div>
        ) : (
          // Vehicle Cards Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl overflow-hidden border border-pictus-lime/30 hover:border-pictus-lime/50 transition-all"
              >
                {vehicle.image && (
                  <div className="relative w-full h-48 bg-pictus-black/50 overflow-hidden">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.registration}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-3xl font-light text-pictus-white mb-2">{vehicle.registration}</h3>
                    <p className="text-xl text-pictus-lime">{vehicle.type}</p>
                    {vehicle.year && (
                      <p className="text-lg text-pictus-lime mt-1">Rok: {vehicle.year}</p>
                    )}
                  </div>

                  {vehicle.note && (
                    <p className="text-pictus-white/80 text-sm mb-4 line-clamp-2">{vehicle.note}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setExpensesModalOpen(true)
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-600/30 text-pictus-white px-3 py-2 rounded-lg hover:bg-gray-600/50 transition text-sm"
                      >
                        <FaEuroSign size={16} />
                        Výdavky
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setMileageModalOpen(true)
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-600/30 text-pictus-white px-3 py-2 rounded-lg hover:bg-gray-600/50 transition text-sm"
                      >
                        <Gauge size={16} />
                        Kilometre
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-pictus-lime/20">
                    <Link
                      href={`/client/my-fleet/${vehicle.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-600/30 text-pictus-white px-4 py-2 rounded-lg hover:bg-gray-600/50 transition text-sm"
                    >
                      <Edit size={16} />
                      Upraviť
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600/30 text-pictus-white px-4 py-2 rounded-lg hover:bg-red-600/50 transition text-sm"
                    >
                      <Trash2 size={16} />
                      Odstrániť
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Správa používateľov</h2>
                <p className="text-gray-400 mt-1">Organizácia: {session?.user?.organization}</p>
                {organization?.numberUsers && (
                  <p className="text-sm text-gray-500 mt-1">
                    Počet používateľov: {users.length} / {organization.numberUsers}
                    {users.length >= organization.numberUsers && (
                      <span className="ml-2 text-orange-400">(Limit dosiahnutý)</span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={handleCreateUser}
                disabled={organization?.numberUsers ? users.length >= organization.numberUsers : false}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  organization?.numberUsers && users.length >= organization.numberUsers
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-pictus-black'
                }`}
              >
                <Plus className="h-4 w-4" />
                Pridať používateľa
              </button>
            </div>

            {usersLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Načítavam používateľov...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Žiadni používatelia</p>
                <button
                  onClick={handleCreateUser}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                  Pridať prvého používateľa
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Meno</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Telefón</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rola</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Stav</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Akcie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-white">
                            {user.firstName} {user.lastName}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">{user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">{user.phoneNumber || '-'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">
                            {user.isFleetManager ? 'Správca flotily' : 'Používateľ'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              user.active
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}
                          >
                            {user.active ? 'Aktívny' : 'Neaktívny'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all"
                              title="Upraviť"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {session?.user?.id !== user.id ? (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
                                title="Odstrániť"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                disabled
                                className="p-2 bg-gray-500/20 text-gray-600 border border-gray-500/30 rounded-lg cursor-not-allowed"
                                title="Nemôžete odstrániť seba"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <>
            {!showNotificationBuilder ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Notifikácie</h2>
                    <p className="text-gray-400 mt-1">
                      Organizácia: {session?.user?.organization} ({filteredNotifications.length} z {notifications.length} notifikácií)
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDuplicateNotificationData(null)
                      setShowNotificationBuilder(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-pictus-black rounded-lg transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Vytvoriť notifikáciu
                  </button>
                </div>

                {/* Filters */}
                {notifications.length > 0 && (
                  <div className="mb-6 bg-white/5 border border-white/10 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Vehicle Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Vozidlo
                        </label>
                        <select
                          value={filterVehicle}
                          onChange={(e) => setFilterVehicle(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                        >
                          <option value="">Všetky vozidlá</option>
                          {uniqueVehicles.map((vehicle) => (
                            <option key={vehicle} value={vehicle}>
                              {vehicle}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Person Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Osoba
                        </label>
                        <input
                          type="text"
                          value={filterPerson}
                          onChange={(e) => setFilterPerson(e.target.value)}
                          placeholder="Hľadať meno..."
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime"
                        />
                      </div>

                      {/* Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Typ notifikácie
                        </label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                        >
                          <option value="">Všetky typy</option>
                          {uniqueTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date Preset Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Obdobie
                        </label>
                        <select
                          value={filterDatePreset}
                          onChange={(e) => {
                            setFilterDatePreset(e.target.value as 'all' | 'thisMonth' | 'thisYear' | 'custom')
                            if (e.target.value !== 'custom') {
                              setFilterDateFrom('')
                              setFilterDateTo('')
                            }
                          }}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                        >
                          <option value="all">Všetky dátumy</option>
                          <option value="thisMonth">Tento mesiac</option>
                          <option value="thisYear">Tento rok</option>
                          <option value="custom">Vlastné obdobie</option>
                        </select>
                      </div>

                      {/* Custom Date Range (only shown when custom is selected) */}
                      {filterDatePreset === 'custom' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Od dátumu
                            </label>
                            <input
                              type="date"
                              value={filterDateFrom}
                              onChange={(e) => setFilterDateFrom(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Do dátumu
                            </label>
                            <input
                              type="date"
                              value={filterDateTo}
                              onChange={(e) => setFilterDateTo(e.target.value)}
                              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Clear Filters Button */}
                    {(filterVehicle || filterPerson || filterType || filterDatePreset !== 'all') && (
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            setFilterVehicle('')
                            setFilterPerson('')
                            setFilterType('')
                            setFilterDatePreset('all')
                            setFilterDateFrom('')
                            setFilterDateTo('')
                          }}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all text-sm"
                        >
                          Vymazať filtre
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {notificationsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Načítavam notifikácie...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">Žiadne notifikácie</h3>
                    <p className="text-gray-400 mb-6">
                      Notifikácie pomôžu vašim používateľom nezabudnúť na dôležité udalosti
                    </p>
                    <button
                      onClick={() => {
                        setDuplicateNotificationData(null)
                        setShowNotificationBuilder(true)
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black rounded-lg"
                    >
                      <Plus className="h-5 w-5" />
                      Vytvoriť prvú notifikáciu
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Osoba</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Vozidlo</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Typ</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Kanál</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Stav</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Dátum</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">Akcie</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredNotifications.map((notification) => (
                          <tr key={notification.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-white">#{notification.id}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-white">{notification.personName || '-'}</div>
                              <div className="text-xs text-gray-400">{notification.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-white">{notification.vehicleRegistration || '-'}</div>
                              <div className="text-xs text-gray-400">{notification.vehicleType}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-300">{notification.notificationType || '-'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-300">{notification.notificationChannel || '-'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                  notification.status === 'sent' || notification.status === 'confirmed'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : notification.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    : notification.status === 'failed'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}
                              >
                                {notification.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-300">
                                {notification.notificationDate
                                  ? new Date(notification.notificationDate).toLocaleDateString()
                                  : '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setDuplicateNotificationData(notification)
                                    setShowNotificationBuilder(true)
                                  }}
                                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all"
                                  title="Duplikovať"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDuplicateNotificationData(notification)
                                    setShowNotificationBuilder(true)
                                  }}
                                  className="p-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 border border-gray-500/30 rounded-lg transition-all"
                                  title="Upraviť"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
                                  title="Odstrániť"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* No results message */}
                    {filteredNotifications.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        Žiadne notifikácie podľa vybraných filtrov
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => {
                    setShowNotificationBuilder(false)
                    setDuplicateNotificationData(null)
                  }}
                  className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  ← Späť na zoznam
                </button>
                <NotificationBuilder
                  organization={session?.user?.organization}
                  organizationTier={organization?.tier}
                  hideChannelDropdown={true}
                  duplicateData={duplicateNotificationData}
                  onSuccess={() => {
                    setShowNotificationBuilder(false)
                    setDuplicateNotificationData(null)
                    fetchNotifications()
                  }}
                  onCancel={() => {
                    setShowNotificationBuilder(false)
                    setDuplicateNotificationData(null)
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* Settings Tab (Business tier only) */}
        {activeTab === 'settings' && organization?.tier === 'Business' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">Nastavenia notifikácií</h2>
              <p className="text-gray-400">
                Ako Business organizácia môžete spravovať vlastné typy notifikácií a šablóny.
              </p>
              <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  ℹ️ Ak nie sú definované vlastné typy, použijú sa predvolené možnosti z DEFAULT organizácie.
                </p>
              </div>
              {organization?.numberNotificationTypes && (
                <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <p className="text-orange-300 text-sm">
                    ⚠️ Limit typov notifikácií: {organization.numberNotificationTypes}
                  </p>
                </div>
              )}
            </div>
            {session?.user?.organization && (
              <NotificationSettings organization={session.user.organization} />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedVehicle && (
        <>
          <ExpensesModal
            isOpen={expensesModalOpen}
            onClose={() => {
              setExpensesModalOpen(false)
              setSelectedVehicle(null)
            }}
            vehicleId={selectedVehicle.id}
            vehicleRegistration={selectedVehicle.registration}
          />
          <MileageModal
            isOpen={mileageModalOpen}
            onClose={() => {
              setMileageModalOpen(false)
              setSelectedVehicle(null)
            }}
            vehicleId={selectedVehicle.id}
            vehicleRegistration={selectedVehicle.registration}
          />
        </>
      )}

      {/* User Modal */}
      {session?.user?.organization && (
        <FleetManagerUserModal
          isOpen={userModalOpen}
          onClose={() => {
            setUserModalOpen(false)
            setEditingUser(null)
          }}
          onSuccess={handleUserModalSuccess}
          user={editingUser}
          organization={session.user.organization}
        />
      )}
    </div>
  )
}

export default MyFleetPage
