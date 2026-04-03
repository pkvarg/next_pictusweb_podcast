'use client'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Link, useRouter, usePathname } from '@/i18n/routing'
import {
  User,
  FolderOpen,
  UserCheck,
  LogOut,
  ArrowUp,
  Mail,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Car,
} from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import VehicleNotificationsDashboard from '@/app/components/client/VehicleNotificationsDashboard'
import FleetOverview from '@/app/components/client/FleetOverview'
import SimpleDutyOverview from '@/app/components/client/SimpleDutyOverview'
import NotificationLimitBanner from '@/app/components/client/NotificationLimitBanner'
import ExpiredBanner from '@/app/components/client/ExpiredBanner'
import UpgradeBanner from '@/app/components/client/UpgradeBanner'
import VerifyContactInfo from '@/app/components/client/VerifyContactInfo'

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
  tierRelation?: TierInfo
  currentNotificationsCount: number
  notificationsBlocked: boolean
  freeTrialEndDate: string | null
  freeTrialTierId: string | null
  stripeSubscriptionStatus: string | null
  billingInterval: string | null
  purchasedVehicles: number | null
}

const ClientZone = () => {
  const { data: session } = useSession()
  const t = useTranslations('Client')
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'
  const router = useRouter()
  const pathname = usePathname()
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false)
  const [upgradedFromTier, setUpgradedFromTier] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('upgraded') === '1') {
        setShowUpgradeBanner(true)
        setUpgradedFromTier(params.get('from') || null)
      }
    }
  }, [])
  const iframe1Ref = useRef<HTMLIFrameElement>(null)
  const iframe2Ref = useRef<HTMLIFrameElement>(null)
  const iframe3Ref = useRef<HTMLIFrameElement>(null)

  // Organization state
  const [organization, setOrganization] = useState<Organization | null>(null)

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordChangeError, setPasswordChangeError] = useState('')
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('')

  // Vehicle count management
  const [editingVehicles, setEditingVehicles] = useState(false)
  const [newVehicleCount, setNewVehicleCount] = useState(1)
  const [vehicleUpdateLoading, setVehicleUpdateLoading] = useState(false)
  const [vehicleUpdateMsg, setVehicleUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Guard: organization deleted
  const isOrgDeleted = (session?.user as any)?.organizationDeleted === true

  // Fetch organization details
  const fetchOrganization = useCallback(async () => {
    // session.user.organization now contains the UUID (after migration)
    const orgId = (session?.user as any)?.organization
    if (!orgId) return

    try {
      const response = await fetch(`/api/organizations?id=${orgId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.organizations && data.organizations.length > 0) {
          setOrganization(data.organizations[0])
        }
      }
    } catch (err) {
      console.error('Error fetching organization:', err)
    }
  }, [session?.user])

  useEffect(() => {
    if (session?.user) {
      fetchOrganization()
    }
  }, [session?.user, fetchOrganization])

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleVehicleUpdate = async () => {
    setVehicleUpdateLoading(true)
    setVehicleUpdateMsg(null)
    try {
      const res = await fetch('/api/organizations/update-vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleCount: newVehicleCount }),
      })
      const data = await res.json()
      if (!res.ok) {
        setVehicleUpdateMsg({ type: 'error', text: data.error })
        return
      }
      setVehicleUpdateMsg({ type: 'success', text: t('vehicleUpdateSuccess') })
      setEditingVehicles(false)
      fetchOrganization()
    } catch {
      setVehicleUpdateMsg({ type: 'error', text: t('vehicleUpdateError') })
    } finally {
      setVehicleUpdateLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordChangeError('')
    setPasswordChangeSuccess('')

    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordChangeError(t('passwordsMismatch'))
      return
    }

    if (newPassword.length < 8) {
      setPasswordChangeError(t('passwordMinLength'))
      return
    }

    setIsChangingPassword(true)

    try {
      // First, verify old password by trying to get user from database
      const verifyResponse = await fetch('/api/user/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
          password: oldPassword,
        }),
      })

      if (!verifyResponse.ok) {
        setPasswordChangeError(t('oldPasswordWrong'))
        setIsChangingPassword(false)
        return
      }

      // Update password in database
      const updateResponse = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
          newPassword: newPassword,
        }),
      })

      if (!updateResponse.ok) {
        setPasswordChangeError(t('passwordChangeError'))
        setIsChangingPassword(false)
        return
      }

      // Send confirmation email
      await fetch(
        `${process.env.NEXT_PUBLIC_HONO_API_URL}/api/pictusweb/client/email-reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: session?.user?.name,
            email: session?.user?.email,
            loginUrl: `${window.location.origin}/${locale}/auth/login`,
            origin: 'PICTUSWEB.SK',
          }),
        },
      )

      setPasswordChangeSuccess(t('passwordChangeSuccess'))
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setShowPasswordChange(false)
        setPasswordChangeSuccess('')
      }, 3000)
    } catch (error) {
      console.error('Password change error:', error)
      setPasswordChangeError(t('passwordChangeError'))
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isOrgDeleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white font-brutal-milk flex items-center justify-center">
        <div className="text-center max-w-lg px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <X className="w-10 h-10 text-red-400" />
          </div>
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
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/client/upgrade"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pictus-lime text-black font-semibold rounded-lg hover:bg-pictus-lime/80 transition-all"
            >
              {t('upgradeNow')}
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
            >
              <LogOut size={18} />
              {t('logOutButton')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white font-brutal-milk">
      {/* Header */}
      <header className="bg-pictus-white/10 backdrop-blur-xl border-b border-pictus-lime/30 sticky top-0 z-40">
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
              {organization?.tierRelation?.name && organization.tierRelation.name !== 'BUSINESS' && (
                <Link
                  href="/client/upgrade"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-white rounded-lg hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all font-medium shrink-0"
                >
                  <ArrowUp size={14} />
                  <span className="hidden sm:inline">{t('upgrade')}</span>
                </Link>
              )}
              <div className="flex items-center gap-0.5 shrink-0">
                {(['sk', 'en', 'hu'] as const).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => router.replace(pathname, { locale: loc })}
                    className={`px-1 py-0.5 text-[10px] sm:text-xs sm:px-1.5 rounded transition-all ${
                      locale === loc
                        ? 'bg-pictus-lime text-black font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {loc.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-pictus-white">
                <User size={16} className="shrink-0" />
                <span className="text-lg truncate">{session?.user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm sm:text-lg text-pictus-white hover:text-red-400 transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-red-500/10 shrink-0"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('logOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Expired free trial banner */}
      {organization?.freeTrialEndDate &&
       new Date(organization.freeTrialEndDate) < new Date() &&
       !organization.stripeSubscriptionStatus && (
        <ExpiredBanner
          tierName={organization.tierRelation?.name || 'BASIC'}
          endDate={organization.freeTrialEndDate}
        />
      )}

      {/* Upgrade success banner */}
      {showUpgradeBanner && organization?.billingInterval && (
        <UpgradeBanner billingInterval={organization.billingInterval} fromTier={upgradedFromTier} />
      )}

      {organization?.tierRelation && (
        <NotificationLimitBanner
          currentCount={organization.currentNotificationsCount}
          limit={organization.tierRelation.notificationsLimit}
          tierName={organization.tierRelation.name}
          blocked={organization.notificationsBlocked}
          subscriptionStatus={organization.stripeSubscriptionStatus}
        />
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <section className="py-10 sm:py-20">
          <div className="text-center mb-8 sm:mb-16">
            <h1 className="text-3xl sm:text-5xl font-light text-pictus-white mb-4 sm:mb-6 leading-tight">
              {t('welcomeTitle')}
            </h1>
            <p className="text-xl sm:text-3xl text-pictus-lime mb-2 sm:mb-3">{session?.user?.name}</p>
            {organization?.tierRelation?.name && (
              <p className="text-sm text-gray-400 mb-3 sm:mb-4">{organization.tierRelation.name}</p>
            )}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light leading-tight text-center mb-6 sm:mb-8">FleetSync</h2>
          </div>
        </section>

        {/* {(session?.user?.organization === 'all' ||
          'cba'.startsWith(session?.user?.organization || '')) && (
          <section id="cba" className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-light text-white mb-4">CBA Dashboard</h2>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-8 backdrop-blur-sm border border-purple-500/30">
              <iframe
                src="https://metabase-u840kgwk0scgkwk8gks0sgs4.pictusweb.com/public/dashboard/56b38c4b-0a20-4810-b4b9-3194b7552fc3"
                className="w-full h-svh rounded-2xl border border-purple-500/30 bg-white/10 backdrop-blur-sm overflow-hidden"
              ></iframe>
            </div>
          </section>
        )} */}

        {/* Fleet Overview Section - Show for ALL users */}
        {organization?.name && (
          <section id="fleet-overview" className="mb-16">
            <FleetOverview
              organization={
                organization.name === 'PICTUSACI'
                  ? 'all'
                  : organization.name === 'demo'
                  ? 'demo'
                  : organization.name
              }
              organizationName={organization.name}
              isFleetManager={session?.user?.isFleetManager || false}
            />
          </section>
        )}

        {/* Upcoming Duties Overview - Show for ALL users */}
        {organization?.name && (
          <section id="dashboard" className="mb-16">
            <div className="md:bg-gradient-to-br md:from-pictus-onyx900/30 md:to-pictus-black/50 md:rounded-3xl p-0 md:p-8 md:backdrop-blur-sm md:border md:border-pictus-lime/30">
              <SimpleDutyOverview
                company={
                  organization.name === 'PICTUSACI'
                    ? 'all'
                    : organization.name === 'demo'
                    ? 'demo'
                    : organization.name
                }
                organizationName={organization.name}
              />
            </div>
          </section>
        )}

        {/* {(session?.user?.organization === 'all' ||
          'demo-pv'.startsWith(session?.user?.organization || '')) && (
          <section id="demo-pv" className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-6xl font-light text-white mb-4">Demo PV Dashboard</h2>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-8 backdrop-blur-sm border border-purple-500/30">
              <VehicleNotificationsDashboard company="DEMO-PV" />
            </div>
          </section>
        )}

        {(session?.user?.organization === 'all' ||
          'firma1'.startsWith(session?.user?.organization || '')) && (
          <section id="firma1" className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-6xl font-light text-white mb-4">Firma1 Dashboard</h2>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-8 backdrop-blur-sm border border-purple-500/30">
              <VehicleNotificationsDashboard company="FIRMA1" />
            </div>
          </section>
        )} */}

        {/* User Info Section */}
        <section className="py-8">
          <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 rounded-xl p-6 backdrop-blur-sm border border-pictus-lime/30">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-pictus-lime" />
              <h2 className="text-2xl sm:text-3xl font-light text-pictus-white">{t('accountInfo')}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* User Profile */}
              <div className="">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-pictus-lime" />
                  <h3 className="text-xl font-normal text-pictus-white">{t('userProfile')}</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-pictus-white text-sm font-light">{t('nameLabel')}</label>
                    <p className="text-pictus-white text-base">{session?.user?.name}</p>
                  </div>
                  <div>
                    <label className="text-pictus-white text-sm font-light">{t('emailLabel')}</label>
                    <p className="text-pictus-white text-base">{session?.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="">
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-5 h-5 text-pictus-lime" />
                  <h3 className="text-xl font-normal text-pictus-white">{t('changePassword')}</h3>
                </div>

                {!showPasswordChange ? (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-white px-4 py-2 rounded-lg font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all text-sm"
                  >
                    {t('changePasswordButton')}
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
                    {/* Old Password */}
                    <div>
                      <label className="text-pictus-white text-lg font-light block mb-2">
                        {t('oldPassword')}
                      </label>
                      <div className="relative">
                        <input
                          type={showOldPassword ? 'text' : 'password'}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-pictus-white/5 border border-pictus-white/10 rounded-lg text-pictus-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent transition-all pr-12"
                          placeholder={t('oldPasswordPlaceholder')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pictus-white transition-colors"
                        >
                          {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="text-pictus-white text-lg font-light block mb-2">
                        {t('newPassword')}
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={8}
                          className="w-full px-4 py-3 bg-pictus-white/5 border border-pictus-white/10 rounded-lg text-pictus-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent transition-all pr-12"
                          placeholder={t('newPasswordPlaceholder')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pictus-white transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="text-pictus-white text-lg font-light block mb-2">
                        {t('confirmNewPassword')}
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={8}
                          className="w-full px-4 py-3 bg-pictus-white/5 border border-pictus-white/10 rounded-lg text-pictus-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent transition-all pr-12"
                          placeholder={t('confirmPasswordPlaceholder')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pictus-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Error Message */}
                    {passwordChangeError && (
                      <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <X size={16} />
                        {passwordChangeError}
                      </div>
                    )}

                    {/* Success Message */}
                    {passwordChangeSuccess && (
                      <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <Check size={16} />
                        {passwordChangeSuccess}
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="flex-1 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-white py-3 px-4 rounded-lg font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 focus:outline-none focus:ring-2 focus:ring-pictus-lime transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-pictus-lime/50"
                      >
                        {isChangingPassword ? (
                          <div className="w-5 h-5 border-2 border-pictus-black/30 border-t-pictus-black rounded-full animate-spin mx-auto" />
                        ) : (
                          t('savePassword')
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordChange(false)
                          setOldPassword('')
                          setNewPassword('')
                          setConfirmPassword('')
                          setPasswordChangeError('')
                          setPasswordChangeSuccess('')
                        }}
                        className="px-6 py-3 bg-pictus-white/10 text-pictus-white rounded-lg font-light hover:bg-pictus-white/20 transition-all"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Subscription & Vehicles */}
            {organization && organization.tierRelation?.name !== 'FREE' && organization.billingInterval && (
              <div className="md:col-span-2 border-t border-pictus-lime/10 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Car className="w-5 h-5 text-pictus-lime" />
                  <h3 className="text-xl font-normal text-pictus-white">{t('subscriptionInfo')}</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-pictus-white text-sm font-light">{t('currentPlan')}</label>
                    <p className="text-pictus-white text-base">{organization.tierRelation?.name} — {organization.billingInterval === 'yearly' ? t('yearly') : t('monthly')}</p>
                  </div>
                  <div>
                    <label className="text-pictus-white text-sm font-light">{t('vehicleCountLabel')}</label>
                    {organization.billingInterval === 'yearly' ? (
                      <div>
                        <p className="text-pictus-white text-base">{organization.purchasedVehicles || 1}</p>
                        <p className="text-xs text-gray-500 mt-1">{t('vehicleContactSupport')}</p>
                      </div>
                    ) : editingVehicles ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min={1}
                          max={organization.tierRelation?.name === 'BASIC' ? 3 : (organization.purchasedVehicles || 1) * 2}
                          value={newVehicleCount}
                          onChange={(e) => setNewVehicleCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                        <button
                          onClick={handleVehicleUpdate}
                          disabled={vehicleUpdateLoading || newVehicleCount === organization.purchasedVehicles}
                          className="px-3 py-1.5 bg-pictus-lime text-pictus-black rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          {vehicleUpdateLoading ? '...' : t('save')}
                        </button>
                        <button
                          onClick={() => { setEditingVehicles(false); setVehicleUpdateMsg(null) }}
                          className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-pictus-white text-base">{organization.purchasedVehicles || 1}</p>
                        <button
                          onClick={() => { setNewVehicleCount(organization.purchasedVehicles || 1); setEditingVehicles(true); setVehicleUpdateMsg(null) }}
                          className="text-pictus-lime text-sm hover:underline"
                        >
                          {t('changeVehicles')}
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-pictus-white text-sm font-light">{t('nextCycleNote')}</label>
                    <p className="text-xs text-gray-400 mt-1">
                      {organization.billingInterval === 'yearly'
                        ? t('yearlyContactSupport')
                        : t('vehicleNextCycleHint')}
                    </p>
                  </div>
                </div>
                {vehicleUpdateMsg && (
                  <div className={`mt-3 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${vehicleUpdateMsg.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-200' : 'bg-red-500/20 border border-red-500/30 text-red-200'}`}>
                    {vehicleUpdateMsg.type === 'success' ? <Check size={16} /> : <X size={16} />}
                    {vehicleUpdateMsg.text}
                  </div>
                )}
              </div>
            )}

            {/* Contact Verification */}
            <div className="md:col-span-2 border-t border-pictus-lime/10 pt-6">
              <VerifyContactInfo />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ClientZone
