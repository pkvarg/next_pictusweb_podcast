'use client'
import { signIn, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LogIn, ShieldCheck } from 'lucide-react'
import PictusPagesHeader from '@/app/components/home/pictus/PictusPagesHeader'
import PictusFooter from '@/app/components/home/pictus/PictusFooter'
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
        setChecking2FA(true)

        await new Promise((r) => setTimeout(r, 400))
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        const userId = sessionData?.user?.id || ''
        const role = sessionData?.user?.role || 'client'

        if (process.env.NEXT_PUBLIC_SKIP_VERIFICATION === 'true') {
          window.location.href = `/${locale}/${role === 'admin' ? 'admin' : 'client'}`
          return
        }

        const trusted = await checkDeviceTrust(userId)
        if (trusted) {
          window.location.href = `/${locale}/${role === 'admin' ? 'admin' : 'client'}`
          return
        }

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
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
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

  return (
    <div className="pl" data-locale={locale}>
      <PictusPagesHeader />
      <main className="section-shell auth-shell">
        <div className="auth-col">
          {step === 'credentials' && (
            <div className="auth-head">
              <h1>{t('signIn')}</h1>
              <p>{t('loginSubtitle')}</p>
            </div>
          )}

          <div className="auth-card">
            {/* Step 1: Credentials */}
            {step === 'credentials' && (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="username">{t('username')}</label>
                  <input
                    id="username"
                    type="text"
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder={t('usernamePlaceholder')}
                  />
                </div>

                <div className="auth-field">
                  <div className="auth-field-head">
                    <label htmlFor="password">{t('password')}</label>
                    <Link href="/auth/forgot-password" className="auth-link">
                      {t('forgotPassword')}
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('passwordPlaceholder')}
                  />
                </div>

                {error && <div className="auth-alert is-error">{error}</div>}

                <button type="submit" disabled={isLoading} className="button button-primary">
                  {isLoading ? (
                    <span className="auth-spinner" />
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      {t('signIn')}
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: 2FA */}
            {step === '2fa' && (
              <form onSubmit={handleVerify2FA} className="auth-form">
                <div className="auth-head" style={{ marginBottom: 0 }}>
                  <span className="auth-icon">
                    <ShieldCheck size={30} />
                  </span>
                  <h1 style={{ fontSize: '1.6rem' }}>{t('twoFaTitle')}</h1>
                  <p>{t('twoFaDescription')}</p>
                </div>

                <div className="auth-field">
                  <label htmlFor="twoFaCode">{t('twoFaCodeLabel')}</label>
                  <input
                    id="twoFaCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="auth-input auth-code"
                    value={twoFaCode}
                    onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={trustDevice}
                    onChange={(e) => setTrustDevice(e.target.checked)}
                  />
                  <span>{t('twoFaTrustDevice')}</span>
                </label>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleResend2FA}
                    disabled={resending || resendCooldown > 0}
                    className="auth-link"
                    style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
                  >
                    {resending
                      ? t('twoFaResending')
                      : resendCooldown > 0
                        ? t('twoFaResendCountdown', { seconds: resendCooldown })
                        : t('twoFaResend')}
                  </button>
                </div>

                {error && <div className="auth-alert is-error">{error}</div>}

                <button
                  type="submit"
                  disabled={isLoading || twoFaCode.length !== 6}
                  className="button button-primary"
                >
                  {isLoading ? (
                    <span className="auth-spinner" />
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
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
                  className="auth-note"
                  style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
                >
                  {t('twoFaBackToLogin')}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <PictusFooter homeBase={`/${locale}`} />
    </div>
  )
}
