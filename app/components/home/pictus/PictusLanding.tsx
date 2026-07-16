'use client'
import React, { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import PictusHeader from './PictusHeader'
import PictusHero from './PictusHero'
import PictusServices from './PictusServices'
import PictusAbout from './PictusAbout'
import PictusWork from './PictusWork'
import PictusProcess from './PictusProcess'
import PictusTestimonials from './PictusTestimonials'
import PictusCta from './PictusCta'
import PictusFooter from './PictusFooter'

const PictusLanding = () => {
  const t = useTranslations('Landing')
  const { locale } = useParams()

  // Only load/play the stardust video on desktop — keep mobile light and fast.
  const [showSky, setShowSky] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setShowSky(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return (
    <div className="pl" id="top" data-locale={typeof locale === 'string' ? locale : 'sk'}>
      {showSky && (
        <div className="pl-sky" aria-hidden="true">
          <video className="pl-sky-video" autoPlay muted loop playsInline preload="auto">
            <source src="/pictus/backgrounds/stardust.mp4" type="video/mp4" />
          </video>
        </div>
      )}
      <a className="skip-link" href="#main">
        {t('skipLink')}
      </a>
      <PictusHeader />
      <main id="main">
        <PictusHero />
        <PictusServices />
        <PictusAbout />
        <PictusWork />
        <PictusProcess />
        <PictusTestimonials />
        <PictusCta />
      </main>
      <PictusFooter />
    </div>
  )
}

export default PictusLanding
