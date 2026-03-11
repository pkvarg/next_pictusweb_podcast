import React from 'react'
import Header from '../components/Header'
import Projects from '../components/home/Projects'
import Hero from '../components/home/Hero'
import Feedbacks from '../components/home/Feedbacks'
import Footer from '../components/Footer'
import Offer from '../components/home/Offer'
import GetInTouch from '../components/GetInTouch'
import NewServicesSlider from '../components/home/NewServicesSlider'
import { prodLogger } from '@/lib/prodLogger'

const Home = () => {
  prodLogger.serverComponentStart('HomePage')
  
  try {
    const result = (
      <>
        <div className="text-white text-[25px] bg-[#161616]">
          <Hero />
          <NewServicesSlider />
          <Offer />
          <Projects />
          <Feedbacks />
          <GetInTouch />
          <Footer />
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
