import React from 'react'
import Hero from '../components/home/Hero'
import Services from '../components/home/Services'
import ValueProp from '../components/home/ValueProp'
import OurProjects from '../components/home/OurProjects'
import Process from '../components/home/Process'
import Testimonials from '../components/home/Testimonials'
import CallToAction from '../components/home/CallToAction'
import HomeFooter from '../components/home/HomeFooter'
import { prodLogger } from '@/lib/prodLogger'

const Home = () => {
  prodLogger.serverComponentStart('HomePage')

  try {
    const result = (
      <>
        <div className="relative text-white text-[25px] bg-[#161616]">
          {/* Starfield background for entire page */}
          <div className="fixed inset-0 z-0 pointer-events-none stars-small" />
          <div className="fixed inset-0 z-0 pointer-events-none stars-medium" />
          <div className="fixed inset-0 z-0 pointer-events-none stars-large" />
          <Hero />
          <Services />
          <ValueProp />
          <OurProjects />
          <Process />
          <Testimonials />
          <CallToAction />
          <HomeFooter />
        </div>
      </>
    )

    prodLogger.serverComponentEnd('HomePage')
    return result
  } catch (error) {
    prodLogger.error('Error in HomePage', {
      component: 'HomePage',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}

export default Home
