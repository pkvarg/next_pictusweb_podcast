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
  const { locale } = useParams()
  const options = t.raw('cta.form.options') as string[]

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [projectType, setProjectType] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [formStartTime, setFormStartTime] = useState(0)

  useEffect(() => {
    setFormStartTime(Date.now())
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('sending')

    const currentLocale = (locale as string) || 'sk'
    const subject = subjectTranslations[currentLocale] || subjectTranslations.sk
    const mailMessage = projectType ? `${projectType}\n\n${message}` : message

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: '',
          mailMessage,
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
        setProjectType('')
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
    <section
      className="section-shell section-muted cta"
      id="contact"
      aria-labelledby="contact-title"
    >
      <video className="cta-video" autoPlay muted loop playsInline aria-hidden="true">
        <source src="/pictus/backgrounds/stardust.mp4" type="video/mp4" />
      </video>
      <div className="cta-video-fill" aria-hidden="true"></div>
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
        <form className="contact-card" ref={formRef} onSubmit={handleSubmit}>
          <div className="contact-field">
            <label htmlFor="contact-name">{t('cta.form.name')}</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder={t('cta.form.name')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-email">{t('cta.form.email')}</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t('cta.form.emailPlaceholder')}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="contact-field">
            <label htmlFor="contact-project-type">{t('cta.form.projectType')}</label>
            <select
              id="contact-project-type"
              name="project-type"
              value={projectType}
              onChange={(event) => setProjectType(event.target.value)}
              required
            >
              <option value="" disabled>
                {t('cta.form.projectType')}
              </option>
              {options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="contact-field">
            <label htmlFor="contact-message">{t('cta.form.message')}</label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              placeholder={t('cta.form.message')}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
            ></textarea>
          </div>
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
