import React from 'react'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'
import GdprContent from '@/app/components/contact/GdprContent'
import { setRequestLocale } from 'next-intl/server'

const GdprPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale: paramLocale } = await params
  setRequestLocale(paramLocale)

  return (
    <div className="min-h-screen bg-[#161616] text-white relative">
      <div className="fixed inset-0 z-0 pointer-events-none stars-small" />
      <div className="fixed inset-0 z-0 pointer-events-none stars-medium" />
      <div className="fixed inset-0 z-0 pointer-events-none stars-large" />

      <div className="relative z-10">
        <PagesHeader />
        <GdprContent />
        <Footer />
      </div>
    </div>
  )
}

export default GdprPage
