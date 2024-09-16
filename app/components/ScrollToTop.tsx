'use client'
import React, { useState, useEffect } from 'react'

import { FaAngleUp } from 'react-icons/fa'

const ScrollToTop = () => {
  const [showTopBtn, setShowTopBtn] = useState(false)

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true)
      } else {
        setShowTopBtn(false)
      }
    })
  }, [])

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
  return (
    <section className='top-to-btm'>
      {' '}
      {showTopBtn && (
        <FaAngleUp className='icon-position icon-style' onClick={goToTop} />
      )}{' '}
    </section>
  )
}

export default ScrollToTop
