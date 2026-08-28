'use client'
import { useState, useEffect, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Lock, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import PictusPagesHeader from '@/app/components/home/pictus/PictusPagesHeader'
import PictusFooter from '@/app/components/home/pictus/PictusFooter'

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<'expired' | 'invalid' | 'form' | ''>('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const t = useTranslations('Auth')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const locale = pathname.match(/^\/(en|sk|hu)/)?.[1] || 'sk'

  useEffect(() => {
    const tk = searchParams.get('token')
    if (!tk) {
      setError(t('invalidOrMissingToken'))
      setErrorType('invalid')
      return
    }
    setToken(tk)

    // Validate the token server-side (signature, expiry, single-use).
    ;(async () => {
      try {
        const res = await fetch('/api/auth/verify-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tk }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data.valid) {
          if (data.reason === 'expired') {
            setError(t('linkExpired'))
            setErrorType('expired')
          } else {
            setError(t('invalidToken'))
            setErrorType('invalid')
          }
          return
        }
        setEmail(data.emailMasked || '')
      } catch {
        setError(t('invalidToken'))
        setErrorType('invalid')
      }
    })()
  }, [searchParams, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'))
      setErrorType('form')
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError(t('passwordTooShort'))
      setErrorType('form')
      setIsLoading(false)
      return
    }

    try {
      // The token is the sole authority; the server verifies it, updates the
      // password, and sends the confirmation email.
      const updateResponse = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, locale }),
      })

      if (!updateResponse.ok) {
        const data = await updateResponse.json().catch(() => ({}))
        if (data.code === 'INVALID_TOKEN') {
          setError(t('linkExpired'))
          setErrorType('expired')
          setIsLoading(false)
          return
        }
        throw new Error('Failed to update password')
      }

      setSuccess(true)

      setTimeout(() => {
        router.push(`/${locale}/auth/login`)
      }, 3000)
    } catch (error) {
      console.error('Reset password error:', error)
      setError(t('resetPasswordError'))
      setErrorType('form')
    } finally {
      setIsLoading(false)
    }
  }

  const isBlocked = errorType === 'expired' || errorType === 'invalid'

  return (
    <div className="pl" data-locale={locale}>
      <PictusPagesHeader />
      <main className="section-shell auth-shell">
        <div className="auth-col">
          <Link href="/auth/login" className="auth-back">
            <ArrowLeft className="h-4 w-4" />
            {t('backToLogin')}
          </Link>

          <div className="auth-head">
            <span className="auth-icon">
              <Lock size={28} />
            </span>
            <h1>{t('setNewPassword')}</h1>
            <p>{t('setNewPasswordSubtitle')}</p>
          </div>

          <div className="auth-card">
            {!success && !isBlocked ? (
              <form onSubmit={handleSubmit} className="auth-form">
                {email && (
                  <div className="auth-email-chip">
                    <p className="auth-email-label">{t('resetPasswordFor')}</p>
                    <p className="auth-email-value">{email}</p>
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="newPassword">{t('newPassword')}</label>
                  <div className="auth-input-wrap">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      className="auth-input has-trailing"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder={t('newPasswordPlaceholder')}
                    />
                    <button
                      type="button"
                      className="auth-input-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">{t('confirmNewPassword')}</label>
                  <div className="auth-input-wrap">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="auth-input has-trailing"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder={t('confirmNewPasswordPlaceholder')}
                    />
                    <button
                      type="button"
                      className="auth-input-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && errorType === 'form' && (
                  <div className="auth-alert is-error">{error}</div>
                )}

                <button type="submit" disabled={isLoading} className="button button-primary">
                  {isLoading ? (
                    <span className="auth-spinner" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      {t('setNewPasswordButton')}
                    </>
                  )}
                </button>
              </form>
            ) : success ? (
              <div className="auth-success">
                <span className="auth-icon">
                  <Check size={30} />
                </span>
                <h3 style={{ color: 'var(--text)' }}>{t('passwordChanged')}</h3>
                <p className="auth-note">{t('passwordChangedMessage')}</p>
                <p className="auth-note" style={{ opacity: 0.7 }}>
                  {t('redirectingToLogin')}
                </p>
                <Link href="/auth/login" className="auth-link">
                  {t('loginNow')}
                </Link>
              </div>
            ) : (
              <div className="auth-success">
                <span className="auth-icon is-danger">
                  <Lock size={30} />
                </span>
                <h3 style={{ color: 'var(--text)' }}>{t('invalidLink')}</h3>
                <p className="auth-note">{error}</p>
                <Link
                  href="/auth/forgot-password"
                  className="button button-primary"
                  style={{ marginTop: 4 }}
                >
                  {t('requestNewLink')}
                </Link>
                <Link href="/auth/login" className="auth-link">
                  {t('backToLogin')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <PictusFooter homeBase={`/${locale}`} />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="pl">
          <div className="section-shell auth-shell">
            <span className="auth-spinner" />
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
