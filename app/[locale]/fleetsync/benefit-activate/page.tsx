'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'
import { CheckCircle, ShieldCheck, Loader2, ExternalLink } from 'lucide-react'

export default function BenefitActivatePage() {
  const t = useTranslations('Home')
  const tb = useTranslations('Benefit')
  const to = useTranslations('FleetSyncOnboarding')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [valid, setValid] = useState(false)
  const [parentOrgName, setParentOrgName] = useState('')
  const [userName, setUserName] = useState('')
  const [gdprAccepted, setGdprAccepted] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activated, setActivated] = useState(false)
  const [error, setError] = useState('')

  const validateToken = useCallback(async () => {
    try {
      const res = await fetch(`/api/fleetsync/benefit-activate?token=${token}`)
      const data = await res.json()
      setValid(data.valid)
      setParentOrgName(data.parentOrgName || '')
      setUserName(data.userName || '')
    } catch {
      setValid(false)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    validateToken()
  }, [token, validateToken])

  const handleActivate = async () => {
    if (!gdprAccepted || !termsAccepted) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/fleetsync/benefit-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, gdprAccepted: true, termsAccepted: true }),
      })

      if (res.ok) {
        setActivated(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Activation failed')
      }
    } catch {
      setError('Activation failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-pictus-black text-white">
      <PagesHeader />

      <div className="max-w-2xl mx-auto px-4 py-24 lg:py-32">
        {loading ? (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-pictus-lime mx-auto mb-4" />
            <p className="text-gray-400">{tb('activateValidating')}</p>
          </div>
        ) : activated ? (
          /* Success state */
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
            <CheckCircle className="h-16 w-16 text-pictus-lime mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{tb('activateSuccess')}</h1>
            <p className="text-gray-400 mb-6">{tb('activateSuccessDesc')}</p>
            <Link
              href="/fleetsync"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black font-medium rounded-lg hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all shadow-lg hover:shadow-pictus-lime/50"
            >
              {tb('activateGoToFleetSync')}
            </Link>
          </div>
        ) : !valid || !token ? (
          /* Invalid token */
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center">
            <ShieldCheck className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{tb('activateExpired')}</h1>
            <p className="text-gray-400">{tb('activateExpiredDesc')}</p>
          </div>
        ) : (
          /* Activation form */
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
            <div className="text-center mb-8">
              <ShieldCheck className="h-12 w-12 text-pictus-lime mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">{tb('activateTitle')}</h1>
              <p className="text-gray-400">{tb('activateWelcome', { orgName: parentOrgName })}</p>
              {userName && (
                <p className="text-gray-500 text-sm mt-1">
                  {tb('activateWelcomeUser', { userName })}
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm mb-6">
                {error}
              </div>
            )}

            {/* GDPR Consent */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="gdpr"
                  checked={gdprAccepted}
                  onChange={(e) => setGdprAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-pictus-lime bg-gray-100 border-gray-300 rounded focus:ring-pictus-lime"
                />
                <label htmlFor="gdpr" className="text-sm text-gray-300">
                  {to('gdprAgree')}{' '}
                  <a
                    href="/contact#gdpr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-pictus-lime hover:text-pictus-lime400 underline"
                  >
                    {to('gdprLink')}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </label>
              </div>
            </div>

            {/* Trade Rules Consent */}
            <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-pictus-lime bg-gray-100 border-gray-300 rounded focus:ring-pictus-lime"
                />
                <label htmlFor="terms" className="text-sm text-gray-300">
                  {to('termsAgree')}{' '}
                  <a
                    href="/contact#trade-rules"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-pictus-lime hover:text-pictus-lime400 underline"
                  >
                    {to('termsLink')}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </label>
              </div>
            </div>

            <button
              onClick={handleActivate}
              disabled={!gdprAccepted || !termsAccepted || submitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black font-medium rounded-lg hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all shadow-lg hover:shadow-pictus-lime/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {tb('activateActivating')}
                </span>
              ) : (
                tb('activateButton')
              )}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
