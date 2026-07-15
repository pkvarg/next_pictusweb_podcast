'use client'
import React from 'react'
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

  return (
    <div className="pl" id="top" data-locale={typeof locale === 'string' ? locale : 'sk'}>
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
