import React from 'react'
import Contact from '../../components/contact/Contact'
import PagesHeader from '../../components/PagesHeader'
import About from '../../components/contact/About'
import Gdpr from '../../components/contact/Gdpr'
import TradeRules from '../../components/contact/TradeRules'
import Footer from '@/app/components/Footer'
import { getLocale } from 'next-intl/server'

const ContactPage = async () => {
  const locale = await getLocale()
  return (
    <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-black">
      <PagesHeader />
      <Contact />
      <About />
      <Gdpr />
      {locale === 'sk' && <TradeRules />}

      <Footer />
    </div>
  )
}

export default ContactPage
