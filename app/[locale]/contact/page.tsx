import React from 'react'
import ContactWrapper from '../../components/contact/ContactWrapper'
import PagesHeader from '../../components/PagesHeader'
import About from '../../components/contact/About'
import Gdpr from '../../components/contact/Gdpr'
import TradeRules from '../../components/contact/TradeRules'
import Footer from '@/app/components/Footer'
import { setRequestLocale } from 'next-intl/server'

const ContactPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale: paramLocale } = await params
  
  // Enable static rendering for next-intl
  setRequestLocale(paramLocale)
  return (
    <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-black">
      <PagesHeader />
      <ContactWrapper />
      <About />
      <Gdpr />
      <TradeRules />

      <Footer />
    </div>
  )
}

export default ContactPage
