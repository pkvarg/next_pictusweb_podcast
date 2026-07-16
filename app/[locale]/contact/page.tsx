import React from 'react'
import ContactWrapper from '../../components/contact/ContactWrapper'
import PictusPagesHeader from '@/app/components/home/pictus/PictusPagesHeader'
import PictusFooter from '@/app/components/home/pictus/PictusFooter'
import About from '../../components/contact/About'
import { setRequestLocale } from 'next-intl/server'

const ContactPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <div className="pl" data-locale={locale}>
      <PictusPagesHeader />
      <main id="main">
        <ContactWrapper />
        <About />
      </main>
      <PictusFooter homeBase={`/${locale}`} />
    </div>
  )
}

export default ContactPage
