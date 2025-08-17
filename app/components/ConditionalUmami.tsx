'use client'
import Script from 'next/script'
import { useEffect, useState } from 'react'

const ConditionalUmami = () => {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    // Check if user has given consent
    const checkConsent = () => {
      const consent = localStorage.getItem('CookieConsent')
      if (consent === 'true') {
        setHasConsent(true)
      }
    }

    // Check initially
    checkConsent()

    // Listen for storage changes (when consent is given/revoked)
    window.addEventListener('storage', checkConsent)
    
    // Also check periodically in case consent is set in the same tab
    const interval = setInterval(checkConsent, 1000)

    return () => {
      window.removeEventListener('storage', checkConsent)
      clearInterval(interval)
    }
  }, [])

  if (!hasConsent) {
    return null
  }

  return (
    <Script
      defer
      src="https://umami-p00gs00gwcwo00s4k4c4kgg8.pictusweb.com/script.js"
      data-website-id="a388ecb6-5425-4f32-afa7-62d945f69671"
    />
  )
}

export default ConditionalUmami