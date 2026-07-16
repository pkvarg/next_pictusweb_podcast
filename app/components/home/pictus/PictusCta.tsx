'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

const subjectTranslations: Record<string, string> = {
  en: 'Message from pictusweb.sk',
  sk: 'Správa z pictusweb.sk',
  hu: 'Üzenet a pictusweb.sk-ról',
}

const PictusCta = () => {
  const t = useTranslations('Landing')
  const th = useTranslations('Home')
  const { locale } = useParams()
  const currentLocale = (locale as string) || 'sk'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [formStartTime, setFormStartTime] = useState(0)

  useEffect(() => {
    setFormStartTime(Date.now())
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Anti-spam honeypot: silently accept without sending if filled.
    if (honeypot !== '') {
      setStatus('success')
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
      return
    }

    setStatus('sending')

    const subject = subjectTranslations[currentLocale] || subjectTranslations.sk

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          mailMessage: message,
          locale: currentLocale,
          origin: 'PICTUSWEB.SK',
          subject,
          timeSpent: Date.now() - formStartTime,
        }),
      })

      if (!response.ok) {
        setStatus('error')
        return
      }

      const data = await response.json()
      if (data.success) {
        setStatus('success')
        setName('')
        setEmail('')
        setPhone('')
        setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const formRef = useRef<HTMLFormElement>(null)

  return (
    <section className="section-shell section-muted cta" aria-labelledby="contact-title">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="cta-background"
        src="/pictus/backgrounds/cta.png"
        width={1127}
        height={716}
        alt=""
        loading="lazy"
        aria-hidden="true"
      />
      <div className="layout-container cta-content">
        <form className="contact-card" id="contact" ref={formRef} onSubmit={handleSubmit}>
          <div className="contact-field">
            <label htmlFor="contact-name">{th('contactName')}</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder={th('contactName')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-email">{th('contactEmail')}</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={th('contactEmail')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-phone">{th('contactPhone')}</label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={th('contactPhone')}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-message">{th('contactMessage')}</label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              placeholder={th('contactMessage')}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
            ></textarea>
          </div>

          {/* Anti-spam honeypot — visually hidden */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
            <label htmlFor="website_url">Website</label>
            <input
              id="website_url"
              name="website_url"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </div>

          <label className="contact-consent">
            <input type="checkbox" required />
            <span>
              {th('contactAgree')}{' '}
              <a href={`/${currentLocale}/gdpr`} target="_blank" rel="noopener noreferrer">
                {th('contactGdpr')}
              </a>
            </span>
          </label>

          <button className="button button-primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? t('cta.form.sending') : t('cta.form.send')}{' '}
            <span aria-hidden="true">→</span>
          </button>
          {status === 'success' && (
            <p className="contact-status contact-status-success">{t('cta.form.success')}</p>
          )}
          {status === 'error' && (
            <p className="contact-status contact-status-error">{t('cta.form.error')}</p>
          )}
        </form>
        <div className="cta-copy">
          <header className="section-heading">
            <h2 id="contact-title">{t('cta.title')}</h2>
          </header>
        </div>
      </div>
    </section>
  )
}

export default PictusCta
