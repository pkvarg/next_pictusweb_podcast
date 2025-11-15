'use client'
import { signIn, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Headphones, LogIn, Github } from 'lucide-react'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'
import { Link } from '@/i18n/routing'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('Auth')
  const { data: session, status } = useSession()

  // Extract locale from pathname
  const locale = pathname.match(/^\/(en|sk|hu)/)?.[1] || 'sk'

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      console.log('Frontend: User already logged in, redirecting...')
      window.location.href = `/${locale}/client`
    }
  }, [session, locale])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Frontend: Form submitted with username:', username)
    console.log('Frontend: Current session status:', status)
    console.log('Frontend: Current session:', session)

    if (session?.user) {
      console.log('Frontend: Already logged in, redirecting...')
      window.location.href = `/${locale}/client`
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
        callbackUrl: `/${locale}/client`,
      })

      console.log('Frontend: signIn result:', result)

      if (result?.error) {
        console.log('Frontend: Login failed with error:', result.error)
        setError(t('invalidCredentials'))
      } else if (result?.ok) {
        console.log('Frontend: Login successful, redirecting...')
        // Force redirect using window.location
        window.location.href = `/${locale}/client`
      } else {
        console.log('Frontend: Unexpected result:', result)
        setError(t('loginError'))
      }
    } catch (error) {
      console.error('Frontend: Login error:', error)
      setError(t('loginError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: `/${locale}/client` })
    } catch (error) {
      setError(t('loginError'))
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-900 to-purple-900">
      <PagesHeader />
      <div className=" flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            {/* <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Headphones size={32} className="text-white" />
          </div> */}
            {/* <h1 className="text-2xl font-bold text-white">{t('loginTitle')}</h1> */}
            <p className="text-white mt-2">{t('loginSubtitle')}</p>
          </div>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            {/* OAuth Buttons */}
            {/* <div className="space-y-4 mb-6">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                className="w-full bg-white text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all flex items-center justify-center"
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t('signInWithGoogle')}
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('github')}
                className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all flex items-center justify-center"
              >
                <Github className="mr-3 h-5 w-5" />
                {t('signInWithGitHub')}
              </button>
            </div> */}

            {/* Divider */}
            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/10 text-gray-400">{t('orDivider')}</span>
              </div>
            </div> */}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                  {t('username')}
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('usernamePlaceholder')}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                    {t('password')}
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Zabudli ste heslo?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('signIn')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  )
}
