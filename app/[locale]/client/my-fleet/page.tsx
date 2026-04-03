'use client'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
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
  Sparkles,
  RotateCcw,
} from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import ExpensesModal from '@/app/components/client/ExpensesModal'
import MileageModal from '@/app/components/client/MileageModal'
import FleetManagerUserModal from '@/app/components/client/FleetManagerUserModal'
import NotificationBuilder from '@/app/components/admin/NotificationBuilder'
import NotificationSettings from '@/app/components/admin/NotificationSettings'
import RenewalsContent from '@/app/components/client/RenewalsContent'
import { FaEuroSign } from 'react-icons/fa'
import NotificationLimitBanner from '@/app/components/client/NotificationLimitBanner'
import BenefitStats from '@/app/components/admin/BenefitStats'

interface MyVehicleExpense {
  id: string
  item: string
  cost: number
  date: string
  note: string | null
  link: string | null
  createdAt: string
}

interface MyVehicleMileage {
  id: string
  kilometers: number
  date: string
  note: string | null
  createdAt: string
}

interface MyVehicle {
  id: string
  organization: string
  organizationId: string | null
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
  expenses?: MyVehicleExpense[]
  mileageRecords?: MyVehicleMileage[]
}

interface TierInfo {
  id: string
  name: string
  usersLimit: number
  vehiclesLimit: number
  notificationsLimit: number
  templatesLimit: number
  notificationTypesLimit: number
}

interface Organization {
  id: string
  name: string
  tierId: string | null
  mainContact?: string | null
  tierRelation?: TierInfo
  currentUsersCount: number
  currentVehiclesCount: number
  currentNotificationsCount: number
  currentTemplatesCount: number
  currentNotificationTypesCount: number
  usersLimit: number | null
  vehiclesLimit: number | null
  notificationsLimit: number | null
  templatesLimit: number | null
  notificationTypesLimit: number | null
  purchasedVehicles: number | null
  hiddenFromPictusaci: boolean
  notificationsBlocked: boolean
  stripeSubscriptionStatus: string | null
  canCreateBenefit: boolean
  isBenefitOrg: boolean
  createdAt?: string
}

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  organization: string | null // Old field (now contains UUID for backward compatibility)
  organizationId: string | null
  active: boolean
  isFleetManager: boolean
  role: string
  createdAt: string
}

interface VehicleNotification {
  id: number
  dutyBatchId: string | null
  isPdr?: boolean
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
  myVehicle?: {
    id: string
    registration: string
    type: string
    image: string | null
  }
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

type TabType =
  | 'vehicles'
  | 'users'
  | 'notifications'
  | 'renewals'
  | 'templates'
  | 'types'
  | 'organizations'

const MyFleetPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('Client')
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'

  // Check for tab query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab') as TabType
    if (
      tab &&
      [
        'vehicles',
        'users',
        'notifications',
        'renewals',
        'templates',
        'types',
        'organizations',
      ].includes(tab)
    ) {
      setActiveTab(tab)
    }
  }, [])
  const [vehicles, setVehicles] = useState<MyVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expensesModalOpen, setExpensesModalOpen] = useState(false)
  const [mileageModalOpen, setMileageModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<MyVehicle | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('vehicles')
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [orgLoading, setOrgLoading] = useState(false)
  const [isPictusaciUser, setIsPictusaciUser] = useState(false)

  // Debug: Log organization changes
  useEffect(() => {
    console.log('[my-fleet] Organization state changed to:', organization)
    if (organization) {
      console.log(
        '[my-fleet] Organization details - id:',
        organization.id,
        'name:',
        organization.name,
      )
    }
  }, [organization])

  // Organizations state (for PICTUSACI users)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [organizationsLoading, setOrganizationsLoading] = useState(false)

  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [benefitRefreshKey, setBenefitRefreshKey] = useState(0)

  // Notifications state
  const [showNotificationBuilder, setShowNotificationBuilder] = useState(false)
  const [notifications, setNotifications] = useState<VehicleNotification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [duplicateNotificationData, setDuplicateNotificationData] =
    useState<VehicleNotification | null>(null)
  const [editingNotificationId, setEditingNotificationId] = useState<number | null>(null)

  // Renewals state
  const [pendingRenewalsCount, setPendingRenewalsCount] = useState(0)

  // Notification filters
  const [filterVehicle, setFilterVehicle] = useState('')
  const [filterPerson, setFilterPerson] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDatePreset, setFilterDatePreset] = useState<
    'all' | 'thisMonth' | 'thisYear' | 'custom'
  >('all')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [sortByDutyDate, setSortByDutyDate] = useState<'asc' | 'desc' | 'none'>('none')
  const [sortByNotificationDate, setSortByNotificationDate] = useState<'asc' | 'desc' | 'none'>(
    'none',
  )

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  // Define fetch functions with useCallback before useEffect
  const fetchUsers = useCallback(async (orgId: string) => {
    if (!orgId) return

    try {
      setUsersLoading(true)
      const response = await fetch(`/api/users?organizationId=${encodeURIComponent(orgId)}&excludeBenefit=true`)
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
  }, [])

  const fetchOrganization = useCallback(async () => {
    // Use organizationId first, fallback to organization (which contains UUID after migration)
    const orgId = (session?.user as any)?.organizationId || session?.user?.organization
    console.log('[my-fleet] fetchOrganization called - orgId from session:', orgId)
    console.log('[my-fleet] Session user:', session?.user)

    if (!orgId) {
      console.log('[my-fleet] No organizationId found in session:', session?.user)
      return
    }

    try {
      setOrgLoading(true)
      console.log('[my-fleet] Fetching organization with ID:', orgId)
      const response = await fetch(`/api/organizations?id=${orgId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('[my-fleet] Organization API response:', data)
        if (data.organizations && data.organizations.length > 0) {
          const org = data.organizations[0]
          console.log('[my-fleet] Setting organization state to:', org)
          console.log('[my-fleet] Organization ID:', org.id, 'Name:', org.name)
          setOrganization(org)

          // Check if user is PICTUSACI
          if (org.name === 'PICTUSACI') {
            setIsPictusaciUser(true)
          }

          // Fetch users for this organization
          fetchUsers(org.id)
        } else {
          console.log('[my-fleet] No organizations found in response')
        }
      } else {
        console.log('[my-fleet] Organization API error:', response.status, response.statusText)
      }
    } catch (err) {
      console.error('[my-fleet] Error fetching organization:', err)
    } finally {
      setOrgLoading(false)
    }
  }, [session?.user, fetchUsers])

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/my-vehicles')

      if (response.status === 403) {
        setError(t('accessDeniedFleet'))
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
  }, [t])

  const fetchOrganizations = useCallback(async () => {
    try {
      setOrganizationsLoading(true)
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
      }
    } catch (err) {
      console.error('Error fetching organizations:', err)
      setOrganizations([])
    } finally {
      setOrganizationsLoading(false)
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    // Get organizationId from session
    const orgId = (session?.user as any)?.organizationId || session?.user?.organization
    if (!orgId) {
      console.log('No organizationId found, skipping notifications fetch')
      return
    }

    try {
      setNotificationsLoading(true)
      const response = await fetch(`/api/vehicle-notifications?organizationId=${orgId}`)
      if (response.ok) {
        const data = await response.json()
        const allNotifications = Array.isArray(data.notifications) ? data.notifications : []
        setNotifications(allNotifications)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setNotifications([])
    } finally {
      setNotificationsLoading(false)
    }
  }, [session?.user])

  const fetchPendingRenewals = useCallback(async () => {
    // Get organizationId from session
    const orgId = (session?.user as any)?.organizationId || session?.user?.organization
    if (!orgId) {
      return
    }

    try {
      const response = await fetch(`/api/duty-renewals?organizationId=${orgId}&status=pending`)
      if (response.ok) {
        const data = await response.json()
        setPendingRenewalsCount(data.dutyBatches?.length || 0)
      }
    } catch (err) {
      console.error('Error fetching pending renewals:', err)
      setPendingRenewalsCount(0)
    }
  }, [session?.user])

  useEffect(() => {
    // Check if user is authenticated and is fleet manager
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/login')
      return
    }

    // Check if user is fleet manager
    const userIsFleetManager = (session.user as any).isFleetManager || session.user.isFleetManager

    if (!userIsFleetManager) {
      // Not a fleet manager, redirect back to client page
      console.log('Access denied: User is not a fleet manager')
      router.push('/client')
      return
    }

    // Fetch vehicles and organization (organization fetch will trigger users fetch)
    fetchVehicles()
    fetchOrganization()
    fetchNotifications()
    fetchPendingRenewals()
  }, [
    session,
    status,
    router,
    fetchVehicles,
    fetchOrganization,
    fetchNotifications,
    fetchPendingRenewals,
  ])

  // Fetch organizations when tab is active and user is PICTUSACI
  useEffect(() => {
    if (isPictusaciUser && activeTab === 'organizations' && organizations.length === 0) {
      fetchOrganizations()
    }
  }, [isPictusaciUser, activeTab, organizations.length, fetchOrganizations])

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDeleteVehicle'))) {
      return
    }

    try {
      const response = await fetch(`/api/my-vehicles/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete vehicle')
      }

      // Refresh the list and vehicle count
      fetchVehicles()
      fetchOrganization()
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      alert(t('deleteVehicleFailed'))
    }
  }

  const handleDeleteNotification = async (id: number) => {
    if (!confirm(t('confirmDeleteNotification'))) {
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
      alert(t('deleteNotificationFailed'))
    }
  }

  const handleDeleteUser = async (userId: string) => {
    // Prevent deleting yourself
    if (session?.user?.id === userId) {
      alert(t('cannotDeleteSelf'))
      return
    }

    if (!confirm(t('confirmDeleteUser'))) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      if (organization?.id) {
        fetchUsers(organization.id)
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      alert(t('deleteUserFailed'))
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
    if (organization?.id) {
      fetchUsers(organization.id)
    }
    setBenefitRefreshKey((k) => k + 1)
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

  const isPictusaci = organization?.name === 'PICTUSACI'

  // Show access denied if organization is deleted
  const isOrgDeleted = (session?.user as any)?.organizationDeleted === true
  if (session && isOrgDeleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-black text-pictus-white flex items-center justify-center">
        <div className="text-center max-w-lg px-6">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-light mb-4 text-red-400">{t('accessDenied')}</h1>
          <p className="text-lg text-gray-300 mb-6">
            {t('orgDeactivated')}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {t('orgDeactivatedHint')}{' '}
            <a href="mailto:info@pictusweb.sk" className="text-pictus-lime hover:underline">
              info@pictusweb.sk
            </a>
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
          >
            <LogOut size={18} />
            {t('logOutButton')}
          </button>
        </div>
      </div>
    )
  }

  // Show access denied if not fleet manager
  const userIsFleetManager = session?.user
    ? (session.user as any).isFleetManager || session.user.isFleetManager
    : false

  if (session && !userIsFleetManager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-black text-pictus-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-3xl font-light mb-4">{t('accessDenied')}</h2>
          <p className="text-pictus-lime mb-6">
            {t('fleetManagerRequired')}
          </p>
          <Link
            href="/client"
            className="inline-flex items-center gap-2 bg-pictus-lime600 text-pictus-white px-6 py-3 rounded-lg hover:bg-pictus-lime700 transition"
          >
            <ArrowLeft size={20} />
            {t('backToDashboard')}
          </Link>
        </div>
      </div>
    )
  }

  // Filter and sort notifications
  const filteredNotifications = notifications
    .filter((notification) => {
      // Organization filter - notifications are already filtered by organizationId in the API,
      // so we don't need to filter again here. This was causing all notifications to be hidden.
      // The API fetchNotifications already filters by organizationId

      // Vehicle filter
      if (filterVehicle && notification.vehicleRegistration !== filterVehicle) {
        return false
      }

      // Person filter
      if (
        filterPerson &&
        (!notification.personName ||
          !notification.personName.toLowerCase().includes(filterPerson.toLowerCase()))
      ) {
        return false
      }

      // Type filter
      if (filterType && notification.notificationType !== filterType) {
        return false
      }

      // Status filter
      if (filterStatus && notification.status !== filterStatus) {
        return false
      }

      // Date filter
      if (filterDatePreset !== 'all' && notification.notificationDate) {
        const notificationDate = new Date(notification.notificationDate)
        const now = new Date()

        if (filterDatePreset === 'thisMonth') {
          if (
            notificationDate.getMonth() !== now.getMonth() ||
            notificationDate.getFullYear() !== now.getFullYear()
          ) {
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
    .sort((a, b) => {
      // Sort by duty date if selected
      if (sortByDutyDate !== 'none') {
        const dateA = a.dutyDate ? new Date(a.dutyDate).getTime() : 0
        const dateB = b.dutyDate ? new Date(b.dutyDate).getTime() : 0

        if (dateA !== dateB) {
          return sortByDutyDate === 'asc' ? dateA - dateB : dateB - dateA
        }
      }

      // Sort by notification date if selected
      if (sortByNotificationDate !== 'none') {
        const dateA = a.notificationDate ? new Date(a.notificationDate).getTime() : 0
        const dateB = b.notificationDate ? new Date(b.notificationDate).getTime() : 0

        if (dateA !== dateB) {
          return sortByNotificationDate === 'asc' ? dateA - dateB : dateB - dateA
        }
      }

      // Default: sort by creation date descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  // Get unique values for filter dropdowns
  const uniqueVehicles = Array.from(
    new Set(notifications.map((n) => n.vehicleRegistration).filter((v): v is string => Boolean(v))),
  )
  const uniqueTypes = Array.from(
    new Set(notifications.map((n) => n.notificationType).filter((t): t is string => Boolean(t))),
  )
  const uniqueStatuses = Array.from(
    new Set(notifications.map((n) => n.status).filter((s): s is string => Boolean(s))),
  )

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

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-pictus-white">
                <User size={16} />
                <span className="text-lg">{session?.user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm sm:text-lg text-pictus-white hover:text-red-400 transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('logOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {(organization?.tierRelation || organization?.notificationsLimit != null) && organization && (
        <NotificationLimitBanner
          currentCount={organization.currentNotificationsCount}
          limit={organization.notificationsLimit ?? organization.tierRelation?.notificationsLimit ?? 0}
          tierName={organization.tierRelation?.name ?? 'N/A'}
          blocked={organization.notificationsBlocked}
          subscriptionStatus={organization.stripeSubscriptionStatus}
        />
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/client"
            className="inline-flex items-center gap-2 text-pictus-lime hover:text-pictus-lime-200 transition-colors text-lg"
          >
            <ArrowLeft size={20} />
            {t('backToDashboard')}
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex items-center mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-pictus-lime600/20 to-pictus-lime600/20 rounded-xl">
              <Car className="w-8 h-8 sm:w-10 sm:h-10 text-pictus-lime" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light text-pictus-white">FleetSync Manager</h1>
              {organization && (
                <p className="text-lg sm:text-2xl text-pictus-lime flex items-center gap-2 flex-wrap">
                  <Building size={18} className="hidden sm:block" />
                  {organization.name}
                  {organization.tierRelation && (
                    <span className="text-xs sm:text-sm bg-pictus-lime/20 px-2 py-0.5 sm:py-1 rounded">
                      {organization.tierRelation.name}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-white/10 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1 sm:gap-2 min-w-max">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg font-light transition-all whitespace-nowrap ${
                activeTab === 'vehicles'
                  ? 'text-pictus-lime border-b-2 border-pictus-lime'
                  : 'text-gray-400 hover:text-pictus-white'
              }`}
            >
              <Car size={20} />
              {t('vehiclesTab')} ({vehicles.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg font-light transition-all whitespace-nowrap ${
                activeTab === 'users'
                  ? 'text-pictus-lime border-b-2 border-pictus-lime'
                  : 'text-gray-400 hover:text-pictus-white'
              }`}
            >
              <Users size={20} />
              {t('usersTab')}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg font-light transition-all whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'text-pictus-lime border-b-2 border-pictus-lime'
                  : 'text-gray-400 hover:text-pictus-white'
              }`}
            >
              <Bell size={20} />
              {t('notificationsTab')}
            </button>

            {isPictusaciUser && (
              <button
                onClick={() => setActiveTab('organizations')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg font-light transition-all whitespace-nowrap ${
                  activeTab === 'organizations'
                    ? 'text-pictus-lime border-b-2 border-pictus-lime'
                    : 'text-gray-400 hover:text-pictus-white'
                }`}
              >
                <Building size={20} />
                {t('onboardingTab')}
              </button>
            )}
            {organization?.tierRelation?.name === 'BUSINESS' && (
              <>
                <button
                  onClick={() => setActiveTab('types')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg font-light transition-all whitespace-nowrap ${
                    activeTab === 'types'
                      ? 'text-pictus-lime border-b-2 border-pictus-lime'
                      : 'text-gray-400 hover:text-pictus-white'
                  }`}
                >
                  <Settings size={20} />
                  {t('notificationTypesTab')}
                </button>
                <button
                  onClick={() => setActiveTab('templates')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg font-light transition-all whitespace-nowrap ${
                    activeTab === 'templates'
                      ? 'text-pictus-lime border-b-2 border-pictus-lime'
                      : 'text-gray-400 hover:text-pictus-white'
                  }`}
                >
                  <Sparkles size={20} />
                  {t('templatesTab')}
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('renewals')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-lg font-light transition-all whitespace-nowrap ${
                activeTab === 'renewals'
                  ? 'text-pictus-lime border-b-2 border-pictus-lime'
                  : 'text-gray-400 hover:text-pictus-white'
              }`}
            >
              <RotateCcw size={20} />
              {t('renewalsTab')}
              {pendingRenewalsCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {pendingRenewalsCount}
                </span>
              )}
            </button>
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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                {organization && (organization.tierRelation || organization.vehiclesLimit != null) && (
                  <p className="text-sm text-gray-400">
                    {t('vehicleCount', { current: organization.currentVehiclesCount, limit: organization.vehiclesLimit ?? organization.tierRelation?.vehiclesLimit ?? '—' })}
                    {organization.currentVehiclesCount >=
                      (organization.vehiclesLimit ?? organization.tierRelation?.vehiclesLimit ?? Infinity) && (
                      <span className="ml-2 text-orange-400">{t('limitReached')}</span>
                    )}
                  </p>
                )}
              </div>
              <Link
                href="/client/my-fleet/new"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-light transition-all text-lg ${
                  organization &&
                  organization.currentVehiclesCount >= (organization.vehiclesLimit ?? organization.tierRelation?.vehiclesLimit ?? Infinity)
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pictus-lime600 to-pictus-lime600 text-pictus-white hover:from-pictus-lime700 hover:to-pictus-black'
                }`}
                onClick={(e) => {
                  if (
                    organization &&
                    organization.currentVehiclesCount >= (organization.vehiclesLimit ?? organization.tierRelation?.vehiclesLimit ?? Infinity)
                  ) {
                    e.preventDefault()
                    alert(t('vehicleLimitAlert'))
                  }
                }}
              >
                <Plus size={20} />
                {t('addVehicle')}
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
                  <h2 className="text-4xl font-light text-pictus-white mb-4">{t('noVehicles')}</h2>
                  <p className="text-xl text-pictus-lime mb-8">
                    {t('noVehiclesHint')}
                  </p>
                  <Link
                    href="/client/my-fleet/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-white px-8 py-4 rounded-lg font-light hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all text-xl shadow-lg hover:shadow-pictus-lime/50"
                  >
                    <Plus size={24} />
                    {t('addFirstVehicle')}
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
                        <h3 className="text-3xl font-light text-pictus-white mb-2">
                          {vehicle.registration}
                        </h3>
                        <p className="text-xl text-pictus-lime">{vehicle.type}</p>
                        {vehicle.year && (
                          <p className="text-lg text-pictus-lime mt-1">{t('year', { year: vehicle.year })}</p>
                        )}
                      </div>

                      {vehicle.note && (
                        <p className="text-pictus-white/80 text-sm mb-4 line-clamp-2">
                          {vehicle.note}
                        </p>
                      )}

                      {/* Stats Display */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Latest Mileage */}
                        <div className="bg-pictus-white/5 border border-pictus-white/10 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Gauge size={14} className="text-blue-400" />
                            <span className="text-xs text-pictus-white/70">{t('mileageStatus')}</span>
                          </div>
                          {vehicle.mileageRecords && vehicle.mileageRecords.length > 0 ? (
                            <>
                              <p className="text-xl font-light text-pictus-white">
                                {vehicle.mileageRecords[0].kilometers.toLocaleString(locale)}
                              </p>
                              <p className="text-xs text-pictus-white/50">km</p>
                            </>
                          ) : (
                            <p className="text-sm text-pictus-white/50">{t('noData')}</p>
                          )}
                        </div>

                        {/* Total Expenses */}
                        <div className="bg-pictus-white/5 border border-pictus-white/10 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <FaEuroSign size={12} className="text-green-400" />
                            <span className="text-xs text-pictus-white/70">{t('expenses')}</span>
                          </div>
                          {vehicle.expenses && vehicle.expenses.length > 0 ? (
                            <>
                              <p className="text-xl font-light text-pictus-white">
                                {vehicle.expenses
                                  .reduce((sum, exp) => sum + Number(exp.cost), 0)
                                  .toLocaleString(locale, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                              </p>
                              <p className="text-xs text-pictus-white/50">
                                {t('recordCount', { count: vehicle.expenses.length })}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-pictus-white/50">{t('noData')}</p>
                          )}
                        </div>
                      </div>

                      {/* Only show Expenses/Mileage buttons for vehicles from user's organization */}
                      {vehicle.organizationId === organization?.id && (
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
                              {t('expensesButton')}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedVehicle(vehicle)
                                setMileageModalOpen(true)
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-600/30 text-pictus-white px-3 py-2 rounded-lg hover:bg-gray-600/50 transition text-sm"
                            >
                              <Gauge size={16} />
                              {t('mileageButton')}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Only show Edit/Delete buttons for vehicles from user's organization */}
                      {vehicle.organizationId === organization?.id ? (
                        <div className="flex items-center gap-2 pt-4 border-t border-pictus-lime/20">
                          <Link
                            href={`/client/my-fleet/${vehicle.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-600/30 text-pictus-white px-4 py-2 rounded-lg hover:bg-gray-600/50 transition text-sm"
                          >
                            <Edit size={16} />
                            {t('editButton')}
                          </Link>
                          <button
                            onClick={() => handleDelete(vehicle.id)}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600/30 text-pictus-white px-4 py-2 rounded-lg hover:bg-red-600/50 transition text-sm"
                          >
                            <Trash2 size={16} />
                            {t('deleteButton')}
                          </button>
                        </div>
                      ) : (
                        <div className="pt-4 border-t border-pictus-lime/20">
                          <p className="text-gray-400 text-xs text-center italic">
                            {t('viewOnlyVehicle', { orgName: vehicle.organizationRelation?.name || vehicle.organization || '' })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{t('userManagement')}</h2>
                <p className="text-gray-400 mt-1">
                  {t('organization', { name: organization?.name || t('organizationLoading') })}
                </p>
                {organization && (organization.tierRelation || organization.usersLimit != null) && (
                  <p className="text-sm text-gray-500 mt-1">
                    {t('userCount', { current: organization.currentUsersCount, limit: organization.usersLimit ?? organization.tierRelation?.usersLimit ?? '—' })}
                    {organization.currentUsersCount >= (organization.usersLimit ?? organization.tierRelation?.usersLimit ?? Infinity) && (
                      <span className="ml-2 text-orange-400">{t('limitReached')}</span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={handleCreateUser}
                disabled={
                  organization
                    ? organization.currentUsersCount >= (organization.usersLimit ?? organization.tierRelation?.usersLimit ?? Infinity)
                    : false
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  organization &&
                  organization.currentUsersCount >= (organization.usersLimit ?? organization.tierRelation?.usersLimit ?? Infinity)
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-white'
                }`}
              >
                <Plus className="h-4 w-4" />
                {t('addUser')}
              </button>
            </div>

            {usersLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">{t('loadingUsers')}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">{t('noUsers')}</p>
                <button
                  onClick={handleCreateUser}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-white rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                  {t('addFirstUser')}
                </button>
              </div>
            ) : (
              <>
              {/* Mobile: Card layout */}
              <div className="sm:hidden space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        {user.phoneNumber && <p className="text-xs text-gray-400">{user.phoneNumber}</p>}
                      </div>
                      {!isPictusaci && (
                        <div className="flex gap-2">
                          <button onClick={() => handleEditUser(user)} className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all" title={t('editButton')}><Edit className="h-4 w-4" /></button>
                          {session?.user?.id !== user.id ? (
                            <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all" title={t('deleteButton')}><Trash2 className="h-4 w-4" /></button>
                          ) : (
                            <button disabled className="p-2 bg-gray-500/20 text-gray-600 border border-gray-500/30 rounded-lg cursor-not-allowed" title={t('cannotDeleteSelf')}><Trash2 className="h-4 w-4" /></button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{user.isFleetManager ? t('fleetManager') : t('userRole')}</span>
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${user.active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>{user.active ? t('active') : t('inactive')}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: Table layout */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('nameColumn')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('emailColumn')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('phoneColumn')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('roleColumn')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('statusColumn')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('actionsColumn')}
                      </th>
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
                            {user.isFleetManager ? t('fleetManager') : t('userRole')}
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
                            {user.active ? t('active') : t('inactive')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {!isPictusaci && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all"
                                title={t('editButton')}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {session?.user?.id !== user.id ? (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
                                  title={t('deleteButton')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="p-2 bg-gray-500/20 text-gray-600 border border-gray-500/30 rounded-lg cursor-not-allowed"
                                  title={t('cannotDeleteSelf')}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>

          {/* Benefit Stats - shown below user table for orgs that can create benefits */}
          {organization && organization.canCreateBenefit && !organization.isBenefitOrg && (
            <div className="mt-6">
              <BenefitStats key={benefitRefreshKey} organizationId={organization.id} />
            </div>
          )}
          </>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <>
            {!showNotificationBuilder ? (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{t('notificationsTitle')}</h2>
                    <p className="text-gray-400 mt-1">
                      {t('notificationsOrg', { name: organization?.name || t('organizationLoading'), filtered: filteredNotifications.length, total: notifications.length, used: organization?.currentNotificationsCount ?? 0, limit: organization?.notificationsLimit ?? organization?.tierRelation?.notificationsLimit ?? '—' })}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setDuplicateNotificationData(null)
                      setEditingNotificationId(null)
                      setShowNotificationBuilder(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-white rounded-lg transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    {t('createNotification')}
                  </button>
                </div>

                {/* Filters */}
                {notifications.length > 0 && (
                  <div className="mb-6 bg-white/5 border border-white/10 rounded-lg p-3 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {/* Vehicle Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('filterVehicle')}
                        </label>
                        <select
                          value={filterVehicle}
                          onChange={(e) => setFilterVehicle(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                        >
                          <option value="">{t('allVehicles')}</option>
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
                          {t('filterPerson')}
                        </label>
                        <input
                          type="text"
                          value={filterPerson}
                          onChange={(e) => setFilterPerson(e.target.value)}
                          placeholder={t('searchName')}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime"
                        />
                      </div>

                      {/* Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('filterNotificationType')}
                        </label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                        >
                          <option value="">{t('allTypes')}</option>
                          {uniqueTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('filterStatus')}</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                        >
                          <option value="">{t('allStatuses')}</option>
                          {uniqueStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status === 'sent'
                                ? t('statusSent')
                                : status === 'confirmed'
                                  ? t('statusConfirmed')
                                  : status === 'pending'
                                    ? t('statusPending')
                                    : status === 'failed'
                                      ? t('statusFailed')
                                      : status === 'imported'
                                        ? t('statusImported')
                                        : status.startsWith('reminded')
                                          ? t('statusReminded')
                                          : status === 'no_response'
                                            ? t('statusNoResponse')
                                            : status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sort by Duty Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('sortByDutyDate')}
                        </label>
                        <select
                          value={sortByDutyDate}
                          onChange={(e) => {
                            setSortByDutyDate(e.target.value as 'asc' | 'desc' | 'none')
                            if (e.target.value !== 'none') {
                              setSortByNotificationDate('none')
                            }
                          }}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                        >
                          <option value="none">{t('noSort')}</option>
                          <option value="asc">{t('sortAsc')}</option>
                          <option value="desc">{t('sortDesc')}</option>
                        </select>
                      </div>

                      {/* Sort by Notification Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('sortByNotificationDate')}
                        </label>
                        <select
                          value={sortByNotificationDate}
                          onChange={(e) => {
                            setSortByNotificationDate(e.target.value as 'asc' | 'desc' | 'none')
                            if (e.target.value !== 'none') {
                              setSortByDutyDate('none')
                            }
                          }}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                        >
                          <option value="none">{t('noSort')}</option>
                          <option value="asc">{t('sortAsc')}</option>
                          <option value="desc">{t('sortDesc')}</option>
                        </select>
                      </div>

                      {/* Date Preset Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {t('filterPeriod')}
                        </label>
                        <select
                          value={filterDatePreset}
                          onChange={(e) => {
                            setFilterDatePreset(
                              e.target.value as 'all' | 'thisMonth' | 'thisYear' | 'custom',
                            )
                            if (e.target.value !== 'custom') {
                              setFilterDateFrom('')
                              setFilterDateTo('')
                            }
                          }}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                        >
                          <option value="all">{t('allDates')}</option>
                          <option value="thisMonth">{t('thisMonth')}</option>
                          <option value="thisYear">{t('thisYear')}</option>
                          <option value="custom">{t('customPeriod')}</option>
                        </select>
                      </div>

                      {/* Custom Date Range (only shown when custom is selected) */}
                      {filterDatePreset === 'custom' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {t('dateFrom')}
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
                              {t('dateTo')}
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
                    {(filterVehicle ||
                      filterPerson ||
                      filterType ||
                      filterStatus ||
                      sortByDutyDate !== 'none' ||
                      sortByNotificationDate !== 'none' ||
                      filterDatePreset !== 'all') && (
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            setFilterVehicle('')
                            setFilterPerson('')
                            setFilterType('')
                            setFilterStatus('')
                            setSortByDutyDate('none')
                            setSortByNotificationDate('none')
                            setFilterDatePreset('all')
                            setFilterDateFrom('')
                            setFilterDateTo('')
                          }}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all text-sm"
                        >
                          {t('clearFilters')}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {notificationsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">{t('loadingNotifications')}</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">{t('noNotifications')}</h3>
                    <p className="text-gray-400 mb-6">
                      {t('noNotificationsHint')}
                    </p>
                    <button
                      onClick={() => {
                        setDuplicateNotificationData(null)
                        setEditingNotificationId(null)
                        setShowNotificationBuilder(true)
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-white rounded-lg"
                    >
                      <Plus className="h-5 w-5" />
                      {t('createFirstNotification')}
                    </button>
                  </div>
                ) : (
                  <>
                  {/* Mobile: Card layout for notifications */}
                  <div className="sm:hidden space-y-3">
                    {filteredNotifications.map((notification) => (
                      <div key={notification.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-white">#{notification.id} — {notification.vehicleRegistration || notification.myVehicle?.registration || '-'}</p>
                            <p className="text-xs text-gray-400">{notification.personName || '-'} {notification.email ? `(${notification.email})` : ''}</p>
                          </div>
                          <button onClick={() => handleDeleteNotification(notification.id)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all" title={t('deleteButton')}><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs text-gray-400">{notification.notificationType || '-'}</span>
                          {notification.isPdr && <span className="inline-flex items-center px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">PDR</span>}
                          <span className="text-xs text-gray-500">{notification.notificationChannel || '-'}</span>
                          <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${notification.status === 'sent' || notification.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : notification.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : notification.status === 'failed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                            {notification.status === 'sent' ? t('statusSent') : notification.status === 'confirmed' ? t('statusConfirmed') : notification.status === 'pending' ? t('statusPending') : notification.status === 'failed' ? t('statusFailed') : notification.status === 'imported' ? t('statusImported') : notification.status.startsWith('reminded') ? t('statusReminded') : notification.status === 'no_response' ? t('statusNoResponse') : notification.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {notification.notificationDate && <span className="text-pictus-lime">{t('notificationDateLabel', { date: new Date(notification.notificationDate).toLocaleDateString(locale) })}</span>}
                          {notification.dutyDate && <span className="text-gray-400">{t('dutyDateLabel', { date: new Date(notification.dutyDate).toLocaleDateString(locale) })}</span>}
                        </div>
                      </div>
                    ))}
                    {filteredNotifications.length === 0 && (
                      <div className="text-center py-8 text-gray-400">{t('noFilteredNotifications')}</div>
                    )}
                  </div>
                  {/* Desktop: Table layout for notifications */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/5 border-b border-white/10">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            {t('idColumn')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            {t('personColumn')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            {t('vehicleColumn')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            {t('typeColumn')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            {t('channelColumn')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            {t('statusColumn')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            {t('dateColumn')}
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase">
                            {t('actionsColumn')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredNotifications.map((notification) => (
                          <tr key={notification.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-white">
                                #{notification.id}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-white">
                                {notification.personName || '-'}
                              </div>
                              <div className="text-xs text-gray-400">{notification.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-white">
                                {notification.vehicleRegistration || notification.myVehicle?.registration || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-300">
                                  {notification.notificationType || '-'}
                                </div>
                                {notification.isPdr && (
                                  <span className="inline-flex items-center px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                    🔄 PDR
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-300">
                                {notification.notificationChannel || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                  notification.status === 'sent' ||
                                  notification.status === 'confirmed'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : notification.status === 'pending'
                                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                      : notification.status === 'failed'
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : notification.status === 'imported'
                                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}
                              >
                                {notification.status === 'sent'
                                  ? t('statusSent')
                                  : notification.status === 'confirmed'
                                    ? t('statusConfirmed')
                                    : notification.status === 'pending'
                                      ? t('statusPending')
                                      : notification.status === 'failed'
                                        ? t('statusFailed')
                                        : notification.status === 'imported'
                                          ? t('statusImported')
                                          : notification.status.startsWith('reminded')
                                            ? t('statusReminded')
                                            : notification.status === 'no_response'
                                              ? t('statusNoResponse')
                                              : notification.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                {notification.notificationDate && (
                                  <div className="text-sm text-pictus-lime font-medium">
                                    {t('notificationDateLabel', { date: new Date(notification.notificationDate).toLocaleDateString(locale) })}
                                  </div>
                                )}
                                {notification.dutyDate && (
                                  <div className="text-sm text-gray-300">
                                    {t('dutyDateLabel', { date: new Date(notification.dutyDate).toLocaleDateString(locale) })}
                                  </div>
                                )}
                                {!notification.notificationDate && !notification.dutyDate && (
                                  <div className="text-sm text-gray-500">-</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
                                  title={t('deleteButton')}
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
                        {t('noFilteredNotifications')}
                      </div>
                    )}
                  </div>
                  </>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => {
                    setShowNotificationBuilder(false)
                    setDuplicateNotificationData(null)
                    setEditingNotificationId(null)
                  }}
                  className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                >
                  ← {t('backToList')}
                </button>
                {organization ? (
                  <NotificationBuilder
                    organization={organization.name}
                    organizationTier={organization.tierRelation?.name || null}
                    hideChannelDropdown={true}
                    duplicateData={duplicateNotificationData}
                    onSuccess={async () => {
                      // If we're editing, delete the original notification
                      if (editingNotificationId) {
                        try {
                          await fetch(`/api/vehicle-notifications/${editingNotificationId}`, {
                            method: 'DELETE',
                          })
                        } catch (err) {
                          console.error('Error deleting original notification:', err)
                        }
                      }
                      setShowNotificationBuilder(false)
                      setDuplicateNotificationData(null)
                      setEditingNotificationId(null)
                      fetchNotifications()
                    }}
                    onCancel={() => {
                      setShowNotificationBuilder(false)
                      setDuplicateNotificationData(null)
                      setEditingNotificationId(null)
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pictus-lime mx-auto mb-4"></div>
                    <p className="text-gray-400">{t('loadingOrganization')}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Templates Tab (Business tier only) */}
        {activeTab === 'templates' && organization?.tierRelation?.name === 'BUSINESS' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{t('notificationTemplates')}</h2>
              <p className="text-gray-400">{t('manageTemplates')}</p>
            </div>
            {organization?.id && organization.id.trim() !== '' ? (
              <NotificationSettings
                organization={organization.name}
                organizationId={organization.id}
                initialTab="templates"
                hideTabs={true}
                hideOrganizationSelector={true}
              />
            ) : (
              <div className="mt-6 p-8 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-gray-400">{t('loadingOrganization')}</p>
              </div>
            )}
          </div>
        )}

        {/* Types Tab (Business tier only) */}
        {activeTab === 'types' && organization?.tierRelation?.name === 'BUSINESS' && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{t('notificationTypesTitle')}</h2>
              <p className="text-gray-400">{t('manageNotificationTypes')}</p>
              {organization && organization.currentNotificationTypesCount === 0 && (
                <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    {t('noCustomTypesHint')}
                  </p>
                </div>
              )}
              {organization && (organization.tierRelation || organization.notificationTypesLimit != null) && (
                <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <p className="text-orange-300 text-sm">
                    {t('notificationTypesLimit', { current: organization.currentNotificationTypesCount, limit: organization.notificationTypesLimit ?? organization.tierRelation?.notificationTypesLimit ?? '—' })}
                  </p>
                </div>
              )}
            </div>
            {organization?.id && organization.id.trim() !== '' ? (
              <NotificationSettings
                organization={organization.name}
                organizationId={organization.id}
                initialTab="types"
                hideTabs={true}
                hideOrganizationSelector={true}
              />
            ) : (
              <div className="mt-6 p-8 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-gray-400">{t('loadingOrganization')}</p>
              </div>
            )}
          </div>
        )}

        {/* Renewals Tab */}
        {activeTab === 'renewals' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{t('renewalsTitle')}</h2>
                <p className="text-gray-400 mt-1">{t('renewalsHint')}</p>
              </div>
            </div>

            <RenewalsContent embedded={true} />
          </div>
        )}

        {/* Organizations Tab (PICTUSACI only) */}
        {activeTab === 'organizations' && isPictusaciUser && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{t('onboardingTitle')}</h2>
                <p className="text-gray-400 mt-1">{t('onboardingHint')}</p>
              </div>
              <Link
                href="/client/my-fleet/onboard"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-white rounded-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                {t('onboardNewClient')}
              </Link>
            </div>

            {organizationsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">{t('loadingOrganizations')}</p>
              </div>
            ) : organizations.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">{t('noOrganizations')}</h3>
                <p className="text-gray-400 mb-6">{t('noOrganizationsHint')}</p>
                <Link
                  href="/client/my-fleet/onboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-white rounded-lg"
                >
                  <Plus className="h-5 w-5" />
                  {t('onboardFirstClient')}
                </Link>
              </div>
            ) : (
              <>
              {/* Mobile: Card layout for organizations */}
              <div className="sm:hidden space-y-3">
                {organizations.map((org) => (
                  <div key={org.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{org.name}</p>
                        {org.mainContact && <p className="text-xs text-gray-400">{t('contactLabel', { contact: org.mainContact })}</p>}
                      </div>
                      {org.tierRelation ? (
                        <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-pictus-lime/20 text-pictus-lime border border-pictus-lime/30">{org.tierRelation.name}</span>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                      <div>
                        <span className="text-gray-500">{t('usersColumn')}</span>
                        <p className="text-gray-300">{org.currentUsersCount ?? '-'} / {org.usersLimit ?? org.tierRelation?.usersLimit ?? '—'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('vehiclesColumn')}</span>
                        <p className="text-gray-300">{org.currentVehiclesCount ?? '-'} / {org.vehiclesLimit ?? org.tierRelation?.vehiclesLimit ?? '—'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('notificationsColumn')}</span>
                        <p className="text-gray-300">{org.currentNotificationsCount ?? '-'} / {org.notificationsLimit ?? org.tierRelation?.notificationsLimit ?? '—'}</p>
                      </div>
                    </div>
                    {org.createdAt && <p className="text-xs text-gray-500 mt-2">{new Date(org.createdAt).toLocaleDateString(locale)}</p>}
                  </div>
                ))}
              </div>
              {/* Desktop: Table layout for organizations */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('orgNameColumn')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('tierColumn')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('usersColumn')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('vehiclesColumn')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('notificationsColumn')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        {t('createdColumn')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-white">{org.name}</div>
                          {org.mainContact && (
                            <div className="text-xs text-gray-400">{t('contactLabel', { contact: org.mainContact })}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {org.tierRelation ? (
                            <span className="inline-flex px-2 py-1 text-xs rounded-full bg-pictus-lime/20 text-pictus-lime border border-pictus-lime/30">
                              {org.tierRelation.name}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">
                            {org.currentUsersCount !== undefined ? (
                              <>
                                {org.currentUsersCount}
                                {` / ${org.usersLimit ?? org.tierRelation?.usersLimit ?? '—'}`}
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">
                            {org.currentVehiclesCount !== undefined ? (
                              <>
                                {org.currentVehiclesCount}
                                {` / ${org.vehiclesLimit ?? org.tierRelation?.vehiclesLimit ?? '—'}`}
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">
                            {org.currentNotificationsCount !== undefined ? (
                              <>
                                {org.currentNotificationsCount}
                                {` / ${org.notificationsLimit ?? org.tierRelation?.notificationsLimit ?? '—'}`}
                              </>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">
                            {org.createdAt
                              ? new Date(org.createdAt).toLocaleDateString(locale)
                              : '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
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
            onSuccess={fetchVehicles}
          />
          <MileageModal
            isOpen={mileageModalOpen}
            onClose={() => {
              setMileageModalOpen(false)
              setSelectedVehicle(null)
            }}
            vehicleId={selectedVehicle.id}
            vehicleRegistration={selectedVehicle.registration}
            onSuccess={fetchVehicles}
          />
        </>
      )}

      {/* User Modal */}
      {organization && (
        <FleetManagerUserModal
          isOpen={userModalOpen}
          onClose={() => {
            setUserModalOpen(false)
            setEditingUser(null)
          }}
          onSuccess={handleUserModalSuccess}
          user={editingUser}
          organization={organization.name}
          organizationId={organization.id}
          canCreateBenefit={organization.canCreateBenefit && !organization.isBenefitOrg}
        />
      )}
    </div>
  )
}

export default MyFleetPage
