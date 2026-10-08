'use client'
import Script from 'next/script'
import { useEffect, useState } from 'react'
import { hasAnalyticsConsent } from '@/lib/cookieConsent'

const ConditionalUmami = () => {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    // Follows the consent both ways; a withdrawal is also enforced by
    // `umami.disabled` (see lib/cookieConsent) for an already loaded script.
    const checkConsent = () => setHasConsent(hasAnalyticsConsent())

    checkConsent()
    window.addEventListener('storage', checkConsent)
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
      src="https://analytics.pictusweb.com/script.js"
      data-website-id="a388ecb6-5425-4f32-afa7-62d945f69671"
    />
  )
}

export default ConditionalUmami
