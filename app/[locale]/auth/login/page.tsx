'use client'
import { signIn, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LogIn, ShieldCheck } from 'lucide-react'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'
import { Link } from '@/i18n/routing'

type Step = 'credentials' | '2fa'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<Step>('credentials')
  const [twoFaCode, setTwoFaCode] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  const [trustDevice, setTrustDevice] = useState(false)
  const [pendingUserId, setPendingUserId] = useState('')
  const [pendingRole, setPendingRole] = useState('')
  const [checking2FA, setChecking2FA] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const pathname = usePathname()
  const t = useTranslations('Auth')
  const { data: session } = useSession()

  const locale = pathname.match(/^\/(en|sk|hu)/)?.[1] || 'sk'

  useEffect(() => {
    if (session?.user && !checking2FA) {
      const redirectPath = session.user.role === 'admin' ? 'admin' : 'client'
      window.location.href = `/${locale}/${redirectPath}`
    }
  }, [session, locale, checking2FA])

  // Read device token from cookie via API and check trust
  async function checkDeviceTrust(userId: string): Promise<boolean> {
    try {
      const cookieRes = await fetch('/api/auth/trust-device/read')
      if (!cookieRes.ok) return false
      const { deviceToken } = await cookieRes.json()
      if (!deviceToken) return false

      const res = await fetch('/api/auth/check-device-trust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, deviceToken }),
      })
      const data = await res.json()
      return data.trusted === true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('invalidCredentials'))
        return
      }

      if (result?.ok) {
        // Block the session useEffect from auto-redirecting while we check 2FA
        setChecking2FA(true)

        // Get session to find userId and role
        await new Promise((r) => setTimeout(r, 400))
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        const userId = sessionData?.user?.id || ''
        const role = sessionData?.user?.role || 'client'

        // Dev mode: skip 2FA entirely when NEXT_PUBLIC_SKIP_VERIFICATION=true
        if (process.env.NEXT_PUBLIC_SKIP_VERIFICATION === 'true') {
          window.location.href = `/${locale}/${role === 'admin' ? 'admin' : 'client'}`
          return
        }

        // Check if this device is trusted → skip 2FA
        const trusted = await checkDeviceTrust(userId)
        if (trusted) {
          window.location.href = `/${locale}/${role === 'admin' ? 'admin' : 'client'}`
          return
        }

        // Not trusted → send 2FA code and show step 2
        setPendingUserId(userId)
        setPendingRole(role)

        await fetch('/api/auth/send-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: username,
            locale,
            ipAddress: '',
            userAgent: navigator.userAgent,
          }),
        }).then(async (r) => {
          const d = await r.json()
          if (d.verificationToken) setVerificationToken(d.verificationToken)
        })

        setStep('2fa')
      }
    } catch {
      setError(t('loginError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationToken,
          code: twoFaCode,
          trustDevice,
          userAgent: navigator.userAgent,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('invalidCredentials'))
        return
      }

      // If trusting device, save the device token as HttpOnly cookie
      if (trustDevice && data.deviceToken) {
        await fetch('/api/auth/trust-device', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceToken: data.deviceToken }),
        })
      }

      window.location.href = `/${locale}/${pendingRole === 'admin' ? 'admin' : 'client'}`
    } catch {
      setError(t('loginError'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const handleResend2FA = async () => {
    setResending(true)
    setError('')
    try {
      const res = await fetch('/api/auth/send-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: username,
          locale,
          ipAddress: '',
          userAgent: navigator.userAgent,
        }),
      })
      const d = await res.json()
      if (d.verificationToken) setVerificationToken(d.verificationToken)
      setTwoFaCode('')
      setResendCooldown(60)
    } catch {
      setError(t('loginError'))
    } finally {
      setResending(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 bg-pictus-white/5 border border-pictus-white/10 rounded-lg text-pictus-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent transition-all'

  return (
    <section className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black font-brutal-milk">
      <PagesHeader />
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-pictus-white mt-2">{t('loginSubtitle')}</p>
          </div>

          <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 backdrop-blur-xl rounded-2xl p-8 border border-pictus-lime/30">

            {/* ── Step 1: Credentials ── */}
            {step === 'credentials' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-lg font-light text-pictus-white mb-2">
                    {t('username')}
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className={inputClass}
                    placeholder={t('usernamePlaceholder')}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-lg font-light text-pictus-white">
                      {t('password')}
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-pictus-lime hover:text-pictus-lime600 transition-colors"
                    >
                      {t('forgotPassword')}
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={inputClass}
                    placeholder={t('passwordPlaceholder')}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black py-3 px-4 rounded-lg font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-pictus-lime/50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-pictus-black/30 border-t-pictus-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {t('signIn')}
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ── Step 2: 2FA ── */}
            {step === '2fa' && (
              <form onSubmit={handleVerify2FA} className="space-y-6">
                <div className="text-center mb-2">
                  <ShieldCheck className="mx-auto mb-3 text-pictus-lime" size={36} />
                  <h2 className="text-xl font-light text-pictus-white">{t('twoFaTitle')}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {t('twoFaDescription')}
                  </p>
                </div>

                <div>
                  <label htmlFor="twoFaCode" className="block text-lg font-light text-pictus-white mb-2">
                    {t('twoFaCodeLabel')}
                  </label>
                  <input
                    id="twoFaCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                    required
                    className={`${inputClass} text-center text-2xl tracking-widest`}
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={trustDevice}
                    onChange={(e) => setTrustDevice(e.target.checked)}
                    className="w-4 h-4 accent-pictus-lime rounded"
                  />
                  <span className="text-sm text-gray-300">{t('twoFaTrustDevice')}</span>
                </label>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend2FA}
                    disabled={resending || resendCooldown > 0}
                    className="text-sm text-pictus-lime hover:text-pictus-lime600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending
                      ? t('twoFaResending')
                      : resendCooldown > 0
                      ? t('twoFaResendCountdown', { seconds: resendCooldown })
                      : t('twoFaResend')}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || twoFaCode.length !== 6}
                  className="w-full bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-white py-3 px-4 rounded-lg font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-pictus-black/30 border-t-pictus-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {t('twoFaConfirm')}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials')
                    setChecking2FA(false)
                    setTwoFaCode('')
                    setError('')
                  }}
                  className="w-full text-sm text-gray-400 hover:text-pictus-white transition-colors"
                >
                  {t('twoFaBackToLogin')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </section>
  )
}
