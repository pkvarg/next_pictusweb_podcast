'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Mail, ArrowLeft, Check } from 'lucide-react'
import PictusPagesHeader from '@/app/components/home/pictus/PictusPagesHeader'
import PictusFooter from '@/app/components/home/pictus/PictusFooter'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const t = useTranslations('Auth')
  const pathname = usePathname()

  const locale = pathname.match(/^\/(en|sk|hu)/)?.[1] || 'sk'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      // The server decides existence, mints the token, and sends the email.
      // The response is intentionally identical whether or not the account
      // exists, so we always show the same confirmation screen.
      const emailResponse = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })

      if (emailResponse.status === 403) {
        const errorData = await emailResponse.json().catch(() => ({}))
        if (errorData.code === 'IP_BANNED') {
          throw new Error(`Access Denied: ${errorData.message}`)
        }
      }

      if (emailResponse.status === 429) {
        setError(t('genericError'))
        setIsLoading(false)
        return
      }

      setSuccess(true)
    } catch (error) {
      console.error('Forgot password error:', error)
      setError(t('genericError'))
    } finally {
      setIsLoading(false)
    }
  }

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
            <h1>{t('resetPasswordTitle')}</h1>
            <p>{t('resetPasswordSubtitle')}</p>
          </div>

          <div className="auth-card">
            {!success ? (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="email">{t('emailLabel')}</label>
                  <div className="auth-input-wrap">
                    <Mail className="auth-input-icon" size={18} />
                    <input
                      id="email"
                      type="email"
                      className="auth-input has-icon"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={t('emailPlaceholder')}
                    />
                  </div>
                </div>

                {error && <div className="auth-alert is-error">{error}</div>}

                <button type="submit" disabled={isLoading} className="button button-primary">
                  {isLoading ? (
                    <span className="auth-spinner" />
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      {t('sendResetLink')}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="auth-success">
                <span className="auth-icon">
                  <Check size={30} />
                </span>
                <h3 style={{ color: 'var(--text)' }}>{t('emailSent')}</h3>
                <p className="auth-note">{t('emailSentMessage')}</p>
                <p className="auth-note" style={{ opacity: 0.7 }}>
                  {t('linkValidFor')}
                </p>
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
