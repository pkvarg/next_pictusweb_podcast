'use client'
import React, { useRef, useState, useEffect } from 'react'
import Message from './Message'
import axios from 'axios'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'
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

  const inputStyles =
    'w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[#F8F8F8] text-base font-light placeholder:text-[#F8F8F8]/25 focus:outline-none focus:border-pictus-lime/40 focus:bg-white/[0.06] transition-all duration-300'

  const labelStyles =
    'block text-sm font-medium text-[#F8F8F8]/50 mb-2 tracking-wider uppercase'

  const fontSystem = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }

  return (
    <>
      <div className="h-8 lg:scroll-mt-14" id="contact"></div>
      <div className="pt-12 lg:pt-20 pb-16 max-w-4xl mx-auto px-6">
        <motion.div
          variants={fadeIn('up', 'tween', 0.1, 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-12"
        >
          <h1 className="font-brutal-milk text-4xl md:text-5xl lg:text-6xl mb-4">
            {t('contactTitle')}
          </h1>
          <div className="h-px w-16 bg-pictus-lime/40 mx-auto" />
        </motion.div>

        <motion.div
          variants={fadeIn('up', 'tween', 0.2, 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="max-w-lg mx-auto"
        >
          {messageSuccess && <Message variant="success">{messageSuccess}</Message>}
          {message && <Message variant="danger">{message}</Message>}

          <form
            ref={form}
            onSubmit={sendEmail}
            className="flex flex-col gap-5"
            style={fontSystem}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyles} style={fontSystem}>
                  {t('contactName')}
                </label>
                <input
                  className={inputStyles}
                  style={fontSystem}
                  type="text"
                  name="user_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelStyles} style={fontSystem}>
                  {t('contactEmail')}
                </label>
                <input
                  className={inputStyles}
                  style={fontSystem}
                  type="email"
                  name="user_email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelStyles} style={fontSystem}>
                {t('contactPhone')}
              </label>
              <input
                className={inputStyles}
                style={fontSystem}
                type="text"
                name="user_phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Anti-spam: Honeypot field - hidden with CSS, bots will fill it */}
            <div
              style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
              aria-hidden="true"
            >
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

            <div>
              <label className={labelStyles} style={fontSystem}>
                {t('contactMessage')}
              </label>
              <textarea
                className={`${inputStyles} resize-none`}
                style={fontSystem}
                rows={5}
                name="message"
                value={mailMessage}
                onChange={(e) => setMailMessage(e.target.value)}
                required
              />
            </div>

            <div className="flex items-start gap-3 mt-2">
              <input
                id="flexCheckDefault"
                type="checkbox"
                defaultChecked={false}
                onChange={handleCheckBox}
                required
                className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 accent-pictus-lime cursor-pointer flex-shrink-0"
              />
              <label
                className="text-[#F8F8F8]/50 text-sm font-light leading-relaxed cursor-pointer"
                htmlFor="flexCheckDefault"
                style={fontSystem}
              >
                {t('contactAgree')}{' '}
                <Link
                  href="/gdpr"
                  className="text-pictus-lime/70 hover:text-pictus-lime underline underline-offset-2 transition-colors"
                  target="_blank"
                >
                  {t('contactGdpr')}
                </Link>
              </label>
            </div>

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

            <button
              className="mt-4 w-full flex items-center justify-center gap-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 px-8 py-3.5 rounded-full text-base font-medium text-pictus-black hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-pictus-lime/30"
              type="submit"
              value="Send"
              style={fontSystem}
            >
              <Send className="w-4 h-4" />
              {t('contactSend')}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  )
}

export default Contact
