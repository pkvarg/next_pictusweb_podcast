'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'
import { CheckCircle, Download, Loader2, Mail } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const t = useTranslations('FleetSyncOnboarding')
  const isFree = searchParams.get('tier') === 'FREE'
  const sessionId = searchParams.get('session_id')
  const [invoiceError, setInvoiceError] = useState('')
  const [invoiceSent, setInvoiceSent] = useState(false)
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const invoiceGenerated = useRef(false)

  useEffect(() => {
    if (isFree || !sessionId || invoiceGenerated.current) return
    invoiceGenerated.current = true

    const generateInvoice = async () => {
      try {
        const stored = sessionStorage.getItem('fleetsync-invoice-data')
        if (!stored) return

        const invoiceData = JSON.parse(stored)
        const locale = window.location.pathname.split('/')[1] || 'en'

        const res = await fetch('/api/fleetsync/generate-invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...invoiceData, locale }),
        })

        if (!res.ok) return

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        setPdfBlobUrl(url)
        setInvoiceSent(true)
      } catch {
        // Silent fail — user can still retry via download button
      }
    }

    generateInvoice()
  }, [isFree, sessionId])

  const handleDownloadInvoice = async () => {
    if (pdfBlobUrl) {
      const a = document.createElement('a')
      a.href = pdfBlobUrl
      a.download = 'fleetsync-faktura.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      return
    }

    // Fallback: regenerate if blob was lost
    setInvoiceError('')
    try {
      const stored = sessionStorage.getItem('fleetsync-invoice-data')
      if (!stored) {
        setInvoiceError(t('invoiceError'))
        return
      }

      const invoiceData = JSON.parse(stored)
      const locale = window.location.pathname.split('/')[1] || 'en'

      const res = await fetch('/api/fleetsync/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...invoiceData, locale }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setInvoiceError(data.error || t('invoiceError'))
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPdfBlobUrl(url)

      const a = document.createElement('a')
      a.href = url
      a.download = 'fleetsync-faktura.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setInvoiceSent(true)
    } catch {
      setInvoiceError(t('invoiceError'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white font-brutal-milk">
      <PagesHeader />
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-pictus-lime/20 rounded-xl inline-block">
            <CheckCircle className="w-12 h-12 text-pictus-lime" />
          </div>
        </div>

        <h1 className="text-3xl lg:text-4xl font-light mb-4">{t('successTitle')}</h1>
        <p className="text-gray-400 text-lg font-light mb-8">
          {isFree ? t('successDescriptionFree') : t('successDescriptionPaid')}
        </p>

        <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-2xl p-6 mb-8 text-left border border-pictus-lime/30 backdrop-blur-sm">
          <h3 className="font-normal text-lg mb-4 text-pictus-white">{t('successNextSteps')}</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black text-sm w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-normal">1</span>
              <p className="text-gray-300 font-light">{t('successStep1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black text-sm w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-normal">2</span>
              <p className="text-gray-300 font-light">{t('successStep2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black text-sm w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-normal">3</span>
              <p className="text-gray-300 font-light">{t('successStep3')}</p>
            </div>
          </div>
        </div>

        {!isFree && sessionId && (
          <div className="mb-6">
            {invoiceSent && (
              <p className="text-pictus-lime text-sm mb-3 font-light flex items-center justify-center gap-1.5">
                <Mail className="w-4 h-4" />
                {t('invoiceSentToEmail')}
              </p>
            )}
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-pictus-lime/30 text-pictus-lime hover:bg-pictus-lime/10 transition-all font-light"
            >
              <Download className="w-5 h-5" />
              {t('downloadInvoice')}
            </button>
            {invoiceError && (
              <p className="text-red-400 text-sm mt-2 font-light">{invoiceError}</p>
            )}
          </div>
        )}

        <Link
          href="/auth/login"
          className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all shadow-lg hover:shadow-pictus-lime/50"
        >
          {t('goToLogin')}
        </Link>
      </div>
      <Footer />
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
