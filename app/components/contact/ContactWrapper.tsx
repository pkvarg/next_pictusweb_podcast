'use client'
import React, { Suspense } from 'react'
import Contact from './Contact'

const ContactWrapper = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[400px] text-white">Loading...</div>}>
      <Contact />
    </Suspense>
  )
}

export default ContactWrapper