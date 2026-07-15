'use client'
import { useSearchParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { AlertTriangle, Home, Mail } from 'lucide-react'
import PictusPagesHeader from '@/app/components/home/pictus/PictusPagesHeader'
import PictusFooter from '@/app/components/home/pictus/PictusFooter'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const error = searchParams.get('error')
  const t = useTranslations('Error')
  const locale = pathname.match(/^\/(en|sk|hu)/)?.[1] || 'sk'

  const isAccessDenied = error === 'ACCESS_DENIED'

  return (
    <div className="pl" data-locale={locale}>
      <PictusPagesHeader />
      <main className="section-shell auth-shell">
        <div className="auth-col">
          <div className="auth-head">
            <span className="auth-icon is-danger">
              <AlertTriangle size={30} />
            </span>
            <h1>{t('accessDenied')}</h1>
          </div>

          <div className="auth-card">
            {isAccessDenied ? (
              <div className="auth-success" style={{ gap: 18 }}>
                <p className="auth-note">{t('accessDeniedMessage')}</p>
                <p className="auth-note" style={{ opacity: 0.7 }}>
                  {t('contactAdmin')}
                </p>
                <div className="auth-email-chip" style={{ width: '100%', textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      color: 'var(--moss)',
                    }}
                  >
                    <Mail size={16} />
                    {t('adminEmail')}
                  </span>
                </div>
                <Link href="/" className="button button-primary">
                  <Home className="h-4 w-4" />
                  {t('backToHome')}
                </Link>
              </div>
            ) : (
              <div className="auth-success" style={{ gap: 18 }}>
                <p className="auth-note">{t('authError')}</p>
                <p className="auth-note" style={{ opacity: 0.7 }}>
                  {t('errorLabel')} {error}
                </p>
                <Link href="/auth/login" className="button button-primary">
                  {t('tryAgain')}
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
