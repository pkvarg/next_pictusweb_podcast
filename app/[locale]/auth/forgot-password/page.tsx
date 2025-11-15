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
          'Ak je tento email zaregistrovaný v našom systéme, poslali sme vám odkaz na obnovenie hesla.',
        )
        setIsLoading(false)
        // Show success message even if user doesn't exist for security reasons
        setSuccess(true)
        return
      }

      // Generate reset URL with token (you'd typically generate a secure token here)
      const resetToken = btoa(`${email}:${Date.now()}`) // Simple token for demo
      const resetUrl = `${window.location.origin}/${locale}/auth/reset-password?token=${resetToken}`

      // Send forgot password email
      const emailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_HONO_API_URL}/api/pictusweb/client/email-forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: checkData.name || 'Vážený zákazník',
            email: email,
            resetUrl: resetUrl,
            origin: 'PICTUSWEB.SK',
          }),
        },
      )

      if (!emailResponse.ok) {
        throw new Error('Failed to send email')
      }

      setSuccess(true)
    } catch (error) {
      console.error('Forgot password error:', error)
      setError('Nastala chyba. Skúste to prosím neskôr.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-900 to-purple-900">
      <PagesHeader />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back to Login Link */}
          <Link
            href="/auth/login"
            className="inline-flex items-center text-white hover:text-purple-300 transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na prihlásenie
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Obnovenie hesla</h1>
            <p className="text-white mt-2">
              Zadajte svoj email a pošleme vám odkaz na obnovenie hesla.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="vas.email@priklad.sk"
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
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Poslať odkaz na obnovenie
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                  <Check size={32} className="text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Email bol odoslaný!</h3>
                <p className="text-gray-300 mb-6">
                  Ak je tento email zaregistrovaný v našom systéme, poslali sme vám odkaz na
                  obnovenie hesla. Skontrolujte si prosím emailovú schránku.
                </p>
                <p className="text-sm text-gray-400 mb-6">Odkaz je platný 1 hodinu.</p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Späť na prihlásenie
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
