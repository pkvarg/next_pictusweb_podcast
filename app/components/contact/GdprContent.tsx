'use client'
import React, { useEffect } from 'react'
import { useTranslations } from 'next-intl'

// Section ids double as anchors, e.g. /gdpr#contact-form from the contact form.
const sections = [
  { id: 'controller', key: 'Controller' },
  { id: 'contact-form', key: 'ContactForm' },
  { id: 'clients', key: 'Clients' },
  { id: 'fleetsync', key: 'FleetSync' },
  { id: 'fleetsync-newsletter', key: 'Newsletter' },
  { id: 'client-zone', key: 'ClientZone' },
  { id: 'payments', key: 'Payments' },
  { id: 'ai', key: 'Ai' },
  { id: 'references', key: 'References' },
  { id: 'cookies', key: 'Cookies' },
  { id: 'security-logs', key: 'SecurityLogs' },
  { id: 'recipients', key: 'Recipients' },
  { id: 'transfers', key: 'Transfers' },
  { id: 'retention', key: 'Retention' },
  { id: 'rights', key: 'Rights' },
  { id: 'security', key: 'Security' },
  { id: 'automated', key: 'Automated' },
  { id: 'changes', key: 'Changes' },
]

const GdprContent = () => {
  const t = useTranslations('Legal')

  // The router resets scroll after hydration, so jump to the linked section here.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) {
      document.getElementById(id)?.scrollIntoView()
    }
  }, [])

  return (
    <article className="prose">
      <h2>{t('privacyTitle')}</h2>
      <p className="prose-sub">{t('privacySubtitle')}</p>
      <p>{t('privacyIntro')}</p>

      {sections.map(({ id, key }) => (
        <section key={id} id={id}>
          <h3>{t(`privacy${key}Title`)}</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{t(`privacy${key}Text`)}</p>
        </section>
      ))}
    </article>
  )
}

export default GdprContent
