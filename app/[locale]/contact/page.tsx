import React from 'react'
import Contact from '../../components/contact/Contact'
import PagesHeader from '../../components/PagesHeader'
import About from '../../components/contact/About'
import Gdpr from '../../components/contact/Gdpr'
import TradeRules from '../../components/contact/TradeRules'
import Footer from '@/app/components/Footer'

const ContactPage = () => {
  return (
    <div className='hero-gradient'>
      <PagesHeader />
      <Contact />
      <About />
      <Gdpr />
      <TradeRules />
      <Footer />
    </div>
  )
}

export default ContactPage
