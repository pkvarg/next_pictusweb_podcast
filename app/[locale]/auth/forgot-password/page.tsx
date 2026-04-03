'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Mail, ArrowLeft, Check } from 'lucide-react'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const t = useTranslations('Auth')
  const pathname = usePathname()

  // Extract locale from pathname
  const locale = pathname.match(/^\/(en|sk|hu)/)?.[1] || 'sk'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Check if user exists in database
      const checkResponse = await fetch('/api/user/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const checkData = await checkResponse.json()

      if (!checkResponse.ok || !checkData.exists) {
        setError(
          t('emailNotFoundMessage'),
        )
        setIsLoading(false)
        // Show success message even if user doesn't exist for security reasons
        setSuccess(true)
        return
      }

      // Generate reset URL with token (you'd typically generate a secure token here)
      const resetToken = btoa(`${email}:${Date.now()}`) // Simple token for demo
      const resetUrl = `${window.location.origin}/${locale}/auth/reset-password?token=${resetToken}`

      // Send forgot password email via protected endpoint
      const emailResponse = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: checkData.name || 'Vážený zákazník',
          email: email,
          resetUrl: resetUrl,
          origin: 'PICTUSWEB.SK',
          locale: locale,
        }),
      })

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json()
        // Check if IP is banned
        if (errorData.code === 'IP_BANNED') {
          throw new Error(`Access Denied: ${errorData.message}`)
        }
        throw new Error('Failed to send email')
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
    <section className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black font-brutal-milk">
      <PagesHeader />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back to Login Link */}
          <Link
            href="/auth/login"
            className="inline-flex items-center text-pictus-white hover:text-pictus-lime transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToLogin')}
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-pictus-white mb-2">{t('resetPasswordTitle')}</h1>
            <p className="text-pictus-white mt-2">
              {t('resetPasswordSubtitle')}
            </p>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 backdrop-blur-xl rounded-2xl p-8 border border-pictus-lime/30">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-lg font-light text-pictus-white mb-2">
                    {t('emailLabel')}
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 pl-12 bg-pictus-white/5 border border-pictus-white/10 rounded-lg text-pictus-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent transition-all"
                      placeholder={t('emailPlaceholder')}
                    />
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
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
                      <Mail className="mr-2 h-4 w-4" />
                      {t('sendResetLink')}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                  <Check size={32} className="text-green-400" />
                </div>
                <h3 className="text-2xl font-normal text-pictus-white mb-3">{t('emailSent')}</h3>
                <p className="text-pictus-white/80 mb-6">
                  {t('emailSentMessage')}
                </p>
                <p className="text-sm text-pictus-white/60 mb-6">{t('linkValidFor')}</p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-pictus-lime hover:text-pictus-lime600 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('backToLogin')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </section>
  )
}
