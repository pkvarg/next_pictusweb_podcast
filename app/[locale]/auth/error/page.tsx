'use client'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { AlertTriangle, Home, Mail } from 'lucide-react'
import PagesHeader from '@/app/components/PagesHeader'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const t = useTranslations('Error')

  const isAccessDenied = error === 'ACCESS_DENIED'

  return (
    <>
      <PagesHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Error Icon */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{t('accessDenied')}</h1>
          </div>

          {/* Error Message */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            {isAccessDenied ? (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-300 mb-4">{t('accessDeniedMessage')}</p>
                  <p className="text-gray-400 text-sm">{t('contactAdmin')}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-center space-x-2 text-blue-400">
                    <Mail size={16} />
                    <span className="text-sm">{t('adminEmail')}</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Link
                    href="/"
                    className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    {t('backToHome')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-300 mb-4">{t('authError')}</p>
                  <p className="text-gray-400 text-sm">{t('errorLabel')} {error}</p>
                </div>

                <div className="flex justify-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    {t('tryAgain')}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}