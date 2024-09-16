import React from 'react'
import Header from '../components/Header'
import Projects from '../components/home/Projects'
import Hero from '../components/home/Hero'
import Feedbacks from '../components/home/Feedbacks'
import Footer from '../components/Footer'
import Offer from '../components/home/Offer'
import GetInTouch from '../components/GetInTouch'

const Home = () => {
  return (
    <>
      <div className='text-white text-[25px] hero-gradient'>
        <Header />
        <Hero />
        <Offer />
        <Projects />
      </div>
      <div className='second-gradient'>
        <Feedbacks />
        <GetInTouch />
        <Footer />
      </div>
    </>
  )
}

export default Home
