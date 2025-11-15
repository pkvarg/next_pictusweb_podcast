'use client'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import {
  User,
  FolderOpen,
  UserCheck,
  LogOut,
  Mail,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import VehicleNotificationsDashboard from '@/app/components/client/VehicleNotificationsDashboard'

const ClientZone = () => {
  const { data: session } = useSession()
  const t = useTranslations('Client')
  const iframe1Ref = useRef<HTMLIFrameElement>(null)
  const iframe2Ref = useRef<HTMLIFrameElement>(null)
  const iframe3Ref = useRef<HTMLIFrameElement>(null)

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

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordChangeError('')
    setPasswordChangeSuccess('')

    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('Nové heslá sa nezhodujú')
      return
    }

    if (newPassword.length < 8) {
      setPasswordChangeError('Heslo musí mať aspoň 8 znakov')
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
        setPasswordChangeError('Staré heslo nie je správne')
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
        setPasswordChangeError('Chyba pri zmene hesla. Skúste znova.')
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
            loginUrl: `${window.location.origin}/sk/auth/login`,
            origin: 'PICTUSWEB.SK',
          }),
        },
      )

      setPasswordChangeSuccess('Heslo bolo úspešne zmenené!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setShowPasswordChange(false)
        setPasswordChangeSuccess('')
      }, 3000)
    } catch (error) {
      console.error('Password change error:', error)
      setPasswordChangeError('Chyba pri zmene hesla. Skúste znova.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <UserCheck size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Pictusweb</h1>
                  <p className="text-lg text-purple-300 hidden sm:block">FleetSync</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User size={16} />
                <span className="text-lg">{session?.user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-lg text-white hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
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
        {/* Welcome Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-light text-white mb-6 leading-tight">
              {t('welcomeTitle')}
            </h1>
            <p className="text-3xl text-purple-300 mb-6">{session?.user?.name}</p>
            <h2 className="text-5xl lg:text-6xl font-light leading-tight text-center">FleetSync</h2>
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

        {session?.user?.organization && (
          <section id="dashboard" className="mb-16">
            <div className="text-center mb-8">
              {/* <h2 className="text-4xl font-light text-white mb-4">Dashboard</h2> */}
            </div>
            <div className="md:bg-gradient-to-br md:from-purple-600/20 md:to-pink-600/20 md:rounded-3xl p-0 md:p-8 md:backdrop-blur-sm md:border md:border-purple-500/30">
              <VehicleNotificationsDashboard
                company={
                  session.user.organization === 'all'
                    ? 'all'
                    : session.user.organization === 'demo'
                    ? 'demo'
                    : session.user.organization
                }
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
        <section className="py-20">
          <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/30">
            <div className="text-center mb-12">
              <h2 className="text-6xl font-light text-white mb-6">Informácie o účte</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* User Profile */}
              <div className="">
                <div className="flex items-center gap-4 mb-4">
                  <User className="w-8 h-8 text-purple-400" />
                  <h3 className="text-4xl font-semibold text-white">Profil používateľa</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-white text-xl font-medium">Meno</label>
                    <p className="text-white text-2xl">{session?.user?.name}</p>
                  </div>
                  <div>
                    <label className="text-white text-xl font-medium">Email</label>
                    <p className="text-white text-2xl">{session?.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="">
                <div className="flex items-center gap-4 mb-4">
                  <Lock className="w-8 h-8 text-purple-400" />
                  <h3 className="text-4xl font-semibold text-white">Zmena hesla</h3>
                </div>

                {!showPasswordChange ? (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all text-lg"
                  >
                    Zmeniť heslo
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
                    {/* Old Password */}
                    <div>
                      <label className="text-white text-lg font-medium block mb-2">
                        Staré heslo
                      </label>
                      <div className="relative">
                        <input
                          type={showOldPassword ? 'text' : 'password'}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                          placeholder="Zadajte staré heslo"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="text-white text-lg font-medium block mb-2">
                        Nové heslo
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={8}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                          placeholder="Zadajte nové heslo (min. 8 znakov)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="text-white text-lg font-medium block mb-2">
                        Potvrďte nové heslo
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={8}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                          placeholder="Zopakujte nové heslo"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChangingPassword ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : (
                          'Uložiť heslo'
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
                        className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
                      >
                        Zrušiť
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ClientZone
