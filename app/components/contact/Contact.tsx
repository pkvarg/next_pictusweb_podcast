'use client'
import React, { useRef, useState, useEffect } from 'react'
import axios from 'axios'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
import { Send } from 'lucide-react'
import { Link } from '@/i18n/routing'

const Contact = () => {
  const t = useTranslations('Home')
  const { locale } = useParams()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [mailMessage, setMailMessage] = useState('')
  const [checkBox, setCheckBox] = useState<boolean>(false)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // Anti-spam: Time-based validation
  const [formStartTime, setFormStartTime] = useState<number>(0)

  // Anti-spam: Honeypot field
  const [honeypot, setHoneypot] = useState('')

  // Initialize form start time on mount
  useEffect(() => {
    setFormStartTime(Date.now())
  }, [])

  useEffect(() => {
    try {
      const subject = searchParams.get('subject')
      if (subject) {
        setMailMessage(decodeURIComponent(subject))
      }
    } catch (error) {
      console.error('Error reading search params:', error)
    }
  }, [searchParams])

  const handleCheckBox = () => {
    setCheckBox((current) => !current)
  }

  // Anti-spam: Content validation function
  const isSpamContent = (text: string): boolean => {
    if (!text || text.trim().length < 3) return true

    // Check for excessive special characters (more than 40% of content)
    const specialChars = text.match(/[^a-zA-Z0-9\s]/g) || []
    if (specialChars.length / text.length > 0.4) return true

    // Check for random character patterns (less than 20% vowels)
    const vowels = text.match(/[aeiouAEIOUáéíóúýäëïöüÁÉÍÓÚÝ]/g) || []
    if (vowels.length / text.length < 0.2) return true

    // Check for excessive uppercase (more than 50% uppercase letters)
    const uppercase = text.match(/[A-Z]/g) || []
    const letters = text.match(/[a-zA-Z]/g) || []
    if (letters && letters.length > 0 && uppercase.length / letters.length > 0.5) return true

    // Check for repetitive characters (same char 5+ times in a row)
    if (/(.)\1{4,}/.test(text)) return true

    return false
  }

  // Anti-spam: Rate limiting (client-side)
  const checkRateLimit = (): boolean => {
    const storageKey = 'contact_form_submissions'
    const now = Date.now()
    const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
    const maxSubmissions = 3

    try {
      const stored = localStorage.getItem(storageKey)
      const submissions: number[] = stored ? JSON.parse(stored) : []

      // Filter out submissions older than 1 hour
      const recentSubmissions = submissions.filter((time) => now - time < oneHour)

      if (recentSubmissions.length >= maxSubmissions) {
        return false // Rate limit exceeded
      }

      // Add current submission and save
      recentSubmissions.push(now)
      localStorage.setItem(storageKey, JSON.stringify(recentSubmissions))
      return true
    } catch (error) {
      // If localStorage is not available, allow submission
      console.error('Rate limit check error:', error)
      return true
    }
  }

  const logBotAttempt = async (
    detectionType: string,
    detectionDetails: string,
    timeSpent?: number,
  ) => {
    try {
      await fetch('/api/bot-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          message: mailMessage,
          honeypot,
          detectionType,
          detectionDetails,
          locale,
          origin,
          timeSpent,
        }),
      })
    } catch (error) {
      console.error('Error logging bot attempt:', error)
    }
  }

  const form = useRef<HTMLFormElement>(null)
  const x = process.env.NEXT_PUBLIC_EMAIL_EXTRA_ONE
  const y = process.env.NEXT_PUBLIC_EMAIL_EXTRA_TWO
  const [passwordGroupOne, setPasswordGroupOne] = useState(x)
  const [passwordGroupTwo, setPasswordGroupTwo] = useState(y)
  const origin = 'PICTUSWEB.SK'

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const increaseBots = async () => {
    const apiUrl = `${process.env.NEXT_PUBLIC_HONO_API_URL}/api/bots/pictuswebsk/increase`

    try {
      await axios.put(apiUrl, {}, config)
    } catch (error) {
      console.error('Error increasing bots:', error)
    }
  }

  const increaseEmails = async () => {
    const apiUrl = `${process.env.NEXT_PUBLIC_HONO_API_URL}/api/emails/pictuswebsk/increase`

    try {
      await axios.put(apiUrl, {}, config)
    } catch (error) {
      console.error('Error increasing emails:', error)
    }
  }

  const sendEmail = async (e: any) => {
    e.preventDefault()

    // Anti-spam Check 1: Honeypot field
    if (honeypot !== '') {
      const timeSpent = Date.now() - formStartTime
      await logBotAttempt('honeypot', `Honeypot field filled with value: "${honeypot}"`, timeSpent)
      setMessage(t('contactError'))
      setName('')
      setEmail('')
      setPhone('')
      setMailMessage('')
      increaseBots()
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    // Anti-spam Check 2: Time-based validation (minimum 3 seconds)
    const timeSpent = Date.now() - formStartTime
    if (timeSpent < 3000) {
      await logBotAttempt(
        'time-based',
        `Form submitted too quickly: ${timeSpent}ms (minimum: 3000ms)`,
        timeSpent,
      )
      setMessage(t('contactError'))
      setName('')
      setEmail('')
      setPhone('')
      setMailMessage('')
      increaseBots()
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    // Anti-spam Check 3: Content validation
    if (isSpamContent(name) || isSpamContent(mailMessage)) {
      const spamReason = isSpamContent(name) ? 'name field' : 'message field'
      await logBotAttempt('content-validation', `Spam content detected in ${spamReason}`, timeSpent)
      setMessage(t('contactError'))
      setName('')
      setEmail('')
      setPhone('')
      setMailMessage('')
      increaseBots()
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    // Anti-spam Check 4: Rate limiting
    if (!checkRateLimit() && process.env.NEXT_PUBLIC_HONO_API_URL !== 'http://localhost:3013') {
      await logBotAttempt(
        'rate-limit',
        'Rate limit exceeded: More than 3 submissions in 1 hour',
        timeSpent,
      )
      setMessage(t('contactError'))
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    // Original honeypot check (keeping for backward compatibility)
    if (passwordGroupOne !== x || passwordGroupTwo !== y) {
      await logBotAttempt(
        'honeypot-legacy',
        'Legacy honeypot password fields were modified',
        timeSpent,
      )
      setMessage(t('contactError'))
      setName('')
      setEmail('')
      setPhone('')
      setMailMessage('')
      increaseBots()
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      //callContactApi(name, email, phone, mailMessage)
      await callHonoAPI(name, email, phone, mailMessage)
      increaseEmails()
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
      setName('')
      setPhone('')
      setEmail('')
      setMailMessage('')
    }
  }

  const subjectTranslations = {
    en: 'Message from pictusweb.sk',
    sk: 'Správa z pictusweb.sk',
    hu: 'Üzenet a pictusweb.sk-ról',
  }

  const subject =
    subjectTranslations[locale as keyof typeof subjectTranslations] || subjectTranslations.sk

  const callHonoAPI = async (name: string, email: string, phone: string, mailMessage: string) => {
    const options = {
      name,
      email,
      phone,
      mailMessage,
      locale,
      origin,
      subject,
    }

    try {
      const timeSpent = Date.now() - formStartTime
      const sendData = {
        ...options,
        locale,
        origin,
        subject,
        timeSpent,
      }

      // Use local API endpoint which has IP ban protection
      const apiUrl = '/api/contact'

      // Make the API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendData),
      })

      // Check if request was successful
      if (!response.ok) {
        const errorData = await response.json()

        // Check if IP is banned
        if (errorData.code === 'IP_BANNED') {
          setMessage(`Access Denied: ${errorData.message}`)
        } else {
          setMessage(t('contactError'))
        }

        return {
          success: false,
          message: errorData.message || 'Failed to submit form',
        }
      }

      // Return success response
      const data = await response.json()
      if (data.success) {
        setMessageSuccess(t('contactSuccess'))
      }
    } catch (error) {
      setMessage(t('contactError'))
      console.log(error)
    }
  }

  return (
    <section className="section-shell" id="contact" aria-labelledby="contact-title">
      <div className="layout-container">
        <header className="section-heading fs-heading">
          <p className="section-kicker">{t('navbarContact')}</p>
          <h2 id="contact-title">{t('contactTitle')}</h2>
        </header>

        <form
          ref={form}
          onSubmit={sendEmail}
          className="contact-card"
          style={{ width: 'min(100%, 560px)', marginInline: 'auto' }}
        >
          {messageSuccess && (
            <p className="contact-status contact-status-success">{messageSuccess}</p>
          )}
          {message && <p className="contact-status contact-status-error">{message}</p>}

          <div className="contact-field">
            <label htmlFor="contact-name">{t('contactName')}</label>
            <input
              id="contact-name"
              type="text"
              name="user_name"
              autoComplete="name"
              placeholder={t('contactName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">{t('contactEmail')}</label>
            <input
              id="contact-email"
              type="email"
              name="user_email"
              autoComplete="email"
              placeholder={t('contactEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-phone">{t('contactPhone')}</label>
            <input
              id="contact-phone"
              type="tel"
              name="user_phone"
              autoComplete="tel"
              placeholder={t('contactPhone')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="contact-field">
            <label htmlFor="contact-message">{t('contactMessage')}</label>
            <textarea
              id="contact-message"
              name="message"
              rows={5}
              placeholder={t('contactMessage')}
              value={mailMessage}
              onChange={(e) => setMailMessage(e.target.value)}
              required
            />
          </div>

          {/* Anti-spam: Honeypot field - hidden with CSS, bots will fill it */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
            <label htmlFor="website_url">Website</label>
            <input
              type="text"
              id="website_url"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <label className="contact-consent" htmlFor="flexCheckDefault">
            <input
              id="flexCheckDefault"
              type="checkbox"
              defaultChecked={false}
              onChange={handleCheckBox}
              required
            />
            <span>
              {t('contactAgree')}{' '}
              <Link href="/gdpr" target="_blank">
                {t('contactGdpr')}
              </Link>
            </span>
          </label>

          <input
            className="form-control hidden"
            type="text"
            defaultValue={passwordGroupOne}
            onChange={(e) => setPasswordGroupOne(e.target.value)}
          />
          <input
            className="form-control hidden"
            type="text"
            defaultValue={passwordGroupTwo}
            onChange={(e) => setPasswordGroupTwo(e.target.value)}
          />

          <button className="button button-primary" type="submit">
            <Send className="w-4 h-4" />
            {t('contactSend')}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Contact
