'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Lock, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const t = useTranslations('Auth')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Extract locale from pathname
  const locale = pathname.match(/^\/(en|sk|hu)/)?.[1] || 'sk'

  useEffect(() => {
    // Get token from URL and decode it
    const token = searchParams.get('token')
    if (!token) {
      setError('Neplatný alebo chýbajúci token')
      return
    }

    try {
      // Decode the token (format: email:timestamp)
      const decoded = atob(token)
      const [emailFromToken, timestamp] = decoded.split(':')

      // Check if token is expired (1 hour)
      const tokenAge = Date.now() - parseInt(timestamp)
      const oneHour = 60 * 60 * 1000

      if (tokenAge > oneHour) {
        setError('Tento odkaz už vypršal. Požiadajte o nový odkaz na obnovenie hesla.')
        return
      }

      setEmail(emailFromToken)
    } catch (err) {
      setError('Neplatný token')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    // Validation
    if (newPassword !== confirmPassword) {
      setError('Heslá sa nezhodujú')
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Heslo musí mať aspoň 8 znakov')
      setIsLoading(false)
      return
    }

    try {
      // Update password in database
      const updateResponse = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update password')
      }

      // Get user name for email
      const checkResponse = await fetch('/api/user/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const checkData = await checkResponse.json()

      // Send confirmation email
      await fetch(
        `${process.env.NEXT_PUBLIC_HONO_API_URL}/api/pictusweb/client/email-reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: checkData.name || 'Vážený zákazník',
            email: email,
            loginUrl: `${window.location.origin}/${locale}/auth/login`,
            origin: 'PICTUSWEB.SK',
          }),
        },
      )

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push(`/${locale}/auth/login`)
      }, 3000)
    } catch (error) {
      console.error('Reset password error:', error)
      setError('Nastala chyba pri zmene hesla. Skúste to prosím neskôr.')
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
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Nastavte nové heslo</h1>
            <p className="text-white mt-2">Zadajte nové heslo pre váš účet</p>
          </div>

          {/* Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            {!success && !error.includes('vypršal') && !error.includes('Neplatný') ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Display */}
                {email && (
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                    <p className="text-sm text-gray-400">Obnovenie hesla pre:</p>
                    <p className="text-white font-medium">{email}</p>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    Nové heslo
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
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
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-200 mb-2"
                  >
                    Potvrďte nové heslo
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
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
                {error && !error.includes('vypršal') && !error.includes('Neplatný') && (
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
                      <Lock className="mr-2 h-4 w-4" />
                      Nastaviť nové heslo
                    </>
                  )}
                </button>
              </form>
            ) : success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                  <Check size={32} className="text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Heslo bolo zmenené!</h3>
                <p className="text-gray-300 mb-6">
                  Vaše heslo bolo úspešne zmenené. Teraz sa môžete prihlásiť s novým heslom.
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  Presmerovanie na prihlasovaciu stránku...
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Prihlásiť sa teraz
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500">
                  <Lock size={32} className="text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Neplatný odkaz</h3>
                <p className="text-gray-300 mb-6">{error}</p>
                <Link
                  href="/auth/forgot-password"
                  className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all mb-4"
                >
                  Požiadať o nový odkaz
                </Link>
                <div className="mt-4">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Späť na prihlásenie
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </section>
  )
}
