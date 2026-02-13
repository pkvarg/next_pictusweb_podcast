'use client'
import { useState, useEffect, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Lock, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'

function ResetPasswordContent() {
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
    <section className="min-h-screen bg-[#141511]" style={{ fontFamily: "'Brutal Milk', 'Arial', sans-serif", fontWeight: 300 }}>
      <PagesHeader />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back to Login Link */}
          <Link
            href="/auth/login"
            className="inline-flex items-center text-[#F8F8F8] hover:text-[#B6E036] transition-colors mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Späť na prihlásenie
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#B6E036]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-[#B6E036]">
              <Lock size={32} className="text-[#B6E036]" />
            </div>
            <h1 className="text-2xl font-bold text-[#F8F8F8] mb-2">Nastavte nové heslo</h1>
            <p className="text-[#F8F8F8] mt-2">Zadajte nové heslo pre váš účet</p>
          </div>

          {/* Form */}
          <div className="bg-[#141511] rounded-2xl p-8 border border-[#B6E036]/20 shadow-[0px_4px_12px_rgba(0,0,0,0.5)]">
            {!success && !error.includes('vypršal') && !error.includes('Neplatný') ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Display */}
                {email && (
                  <div className="bg-[#B6E036]/5 border border-[#B6E036]/20 rounded-lg px-4 py-3">
                    <p className="text-sm text-[#F8F8F8]/70">Obnovenie hesla pre:</p>
                    <p className="text-[#F8F8F8] font-medium">{email}</p>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-[#F8F8F8] mb-2"
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
                      className="w-full px-4 py-3 bg-[#141511] border border-[#B6E036]/20 rounded-lg text-[#F8F8F8] placeholder-[#F8F8F8]/40 focus:outline-none focus:ring-2 focus:ring-[#B6E036] focus:border-transparent transition-all pr-12"
                      placeholder="Zadajte nové heslo (min. 8 znakov)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F8F8F8]/60 hover:text-[#B6E036] transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[#F8F8F8] mb-2"
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
                      className="w-full px-4 py-3 bg-[#141511] border border-[#B6E036]/20 rounded-lg text-[#F8F8F8] placeholder-[#F8F8F8]/40 focus:outline-none focus:ring-2 focus:ring-[#B6E036] focus:border-transparent transition-all pr-12"
                      placeholder="Zopakujte nové heslo"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F8F8F8]/60 hover:text-[#B6E036] transition-colors"
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
                  className="w-full bg-[#B6E036] text-[#141511] py-3 px-4 rounded-[50px] font-bold hover:bg-[#A5CF2E] focus:outline-none focus:ring-2 focus:ring-[#B6E036] focus:ring-offset-2 focus:ring-offset-[#141511] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#141511]/30 border-t-[#141511] rounded-full animate-spin" />
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
                <div className="w-16 h-16 bg-[#B6E036]/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#B6E036]">
                  <Check size={32} className="text-[#B6E036]" />
                </div>
                <h3 className="text-xl font-semibold text-[#F8F8F8] mb-3">Heslo bolo zmenené!</h3>
                <p className="text-[#F8F8F8]/80 mb-6">
                  Vaše heslo bolo úspešne zmenené. Teraz sa môžete prihlásiť s novým heslom.
                </p>
                <p className="text-sm text-[#F8F8F8]/60 mb-6">
                  Presmerovanie na prihlasovaciu stránku...
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-[#B6E036] hover:text-[#A5CF2E] transition-colors"
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
                <h3 className="text-xl font-semibold text-[#F8F8F8] mb-3">Neplatný odkaz</h3>
                <p className="text-[#F8F8F8]/80 mb-6">{error}</p>
                <Link
                  href="/auth/forgot-password"
                  className="inline-block bg-[#B6E036] text-[#141511] px-6 py-3 rounded-[50px] font-bold hover:bg-[#A5CF2E] transition-all mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                >
                  Požiadať o nový odkaz
                </Link>
                <div className="mt-4">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center text-[#B6E036] hover:text-[#A5CF2E] transition-colors"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <section className="min-h-screen bg-[#141511] flex items-center justify-center" style={{ fontFamily: "'Brutal Milk', 'Arial', sans-serif" }}>
        <div className="w-8 h-8 border-4 border-[#B6E036]/30 border-t-[#B6E036] rounded-full animate-spin" />
      </section>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
