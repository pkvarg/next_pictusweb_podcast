'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Sun, Moon } from 'lucide-react'

const KEY = 'fs-theme'

export default function CarCareThemeToggle() {
  const t = useTranslations('CarCare')
  const [light, setLight] = useState(true)

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(KEY)
    } catch {
      stored = null
    }
    const isLight = stored !== 'dark'
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
    <button
      type="button"
      onClick={toggle}
      aria-label={t('theme.toggle')}
      title={t('theme.toggle')}
      className="w-9 h-9 rounded-full bg-pictus-onyx900 border border-white/10 flex items-center justify-center text-pictus-white hover:border-white/25 transition-colors"
    >
      {light ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  )
}
