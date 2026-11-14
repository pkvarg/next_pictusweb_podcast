'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Sun, Moon } from 'lucide-react'

const KEY = 'fs-theme'

export default function CarCareThemeToggle() {
  const t = useTranslations('CarCare')
  const [light, setLight] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(KEY)
    } catch {
      stored = null
    }
    // Dark is the default; light only when the user has explicitly chosen it.
    const isLight = stored === 'light'
    setLight(isLight)
    document.getElementById('fs-scope')?.classList.toggle('fs-light', isLight)
  }, [])

  const toggle = () => {
    const next = !light
    setLight(next)
    document.getElementById('fs-scope')?.classList.toggle('fs-light', next)
    try {
      localStorage.setItem(KEY, next ? 'light' : 'dark')
    } catch {
      // ignore: private mode / blocked storage
    }
  }

  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-pictus-onyx900/80 p-0.5">
      <button
        type="button"
        onClick={toggle}
        aria-label={t('theme.toggle')}
        title={t('theme.toggle')}
        className="flex items-center justify-center px-2.5 py-1 rounded-full text-gray-400 hover:text-pictus-white transition-colors"
      >
        {light ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    </div>
  )
}
