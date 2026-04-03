import React from 'react'
import ContactWrapper from '../../components/contact/ContactWrapper'
import PagesHeader from '../../components/PagesHeader'
import About from '../../components/contact/About'
import Footer from '@/app/components/Footer'
import { setRequestLocale } from 'next-intl/server'

const ContactPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale: paramLocale } = await params

  // Enable static rendering for next-intl
  setRequestLocale(paramLocale)
  return (
    <div className="min-h-screen bg-[#161616] text-white relative">
      {/* Starfield */}
      <div className="fixed inset-0 z-0 pointer-events-none stars-small" />
      <div className="fixed inset-0 z-0 pointer-events-none stars-medium" />
      <div className="fixed inset-0 z-0 pointer-events-none stars-large" />

      <div className="relative z-10">
        <PagesHeader />
        <ContactWrapper />
        <About />
        <Footer />
      </div>
    </div>
  )
}

export default ContactPage
