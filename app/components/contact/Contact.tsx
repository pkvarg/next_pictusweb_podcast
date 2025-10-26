'use client'
import React, { useRef, useState, useEffect } from 'react'
import Message from './Message'
import axios from 'axios'
import { useTranslations } from 'next-intl'
import { useParams, useSearchParams } from 'next/navigation'

const Contact = () => {
  const t = useTranslations('Home')
  const { locale } = useParams()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [mailMessage, setMailMessage] = useState('')
  const [checkBox, setCheckBox] = useState<boolean>(false)
  const [showGdpr, setShowGdpr] = useState(false)
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

  const toggleShowGdpr = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setShowGdpr((prev) => !prev)
  }

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
    const apiUrl = 'https://hono-api.pictusweb.com/api/bots/pictuswebsk/increase'
    //const apiUrl = 'http://localhost:3013/api/bots/pictuswebsk/increase'
    try {
      const { data } = await axios.put(apiUrl, {}, config)
      console.log('data bots', data)
    } catch (error) {
      console.error('Error increasing bots:', error)
    }
  }

  const increaseEmails = async () => {
    const apiUrl = 'https://hono-api.pictusweb.com/api/emails/pictuswebsk/increase'
    //const apiUrl = 'http://localhost:3013/api/emails/pictuswebsk/increase'
    try {
      const { data } = await axios.put(apiUrl, {}, config)
      console.log('data email', data)
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
    if (!checkRateLimit()) {
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
      const sendData = {
        ...options,
        locale,
        origin,
        subject,
      }

      //const apiUrl = 'http://localhost:3013/api/contact'
      const apiUrl = 'https://hono-api.pictusweb.com/api/contact'

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
    <>
      <div className=" h-8 lg:scroll-mt-14" id="contact"></div>
      <div className="pt-8 lg:pt-16 pb-10 text-[25px] text-white font-light">
        <h1 className="text-[30px] lg:text-[35px] text-white text-center lg:pt-0 py-4">
          {t('contactTitle')}
        </h1>
        <div className="mx-4 md:mx-6 lg:mx-0 flex lg:flex-row flex-col lg:justify-center lg:gap-[10%] ">
          <div className="pt-[50px] lg:pt-0 lg:w-[30%]">
            {messageSuccess && <Message variant="success">{messageSuccess}</Message>}
            {message && <Message variant="danger">{message}</Message>}
            <div>
              <form ref={form} onSubmit={sendEmail} className="flex flex-col gap-[2.5px]">
                <div>
                  <div className="flex flex-col">
                    <label className="form-label mt-[2.5%] text-[20px]">{t('contactName')}</label>
                    <input
                      className="form-control rounded-xl pl-2 text-[#2e2236]"
                      type="text"
                      name="user_name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />

                    <label className="form-label mt-[2.5%] text-[20px]">{t('contactEmail')}</label>
                    <input
                      className="form-control rounded-xl pl-2 text-[#2e2236]"
                      type="email"
                      name="user_email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label className="form-label mt-[2.5%] text-[20px]"> {t('contactPhone')}</label>
                    <input
                      className="form-control rounded-xl pl-2 text-[#2e2236]"
                      type="text"
                      name="user_phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />

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
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="form-label mt-[2.5%] text-[20px]">{t('contactMessage')}</label>
                  <textarea
                    className="form-control rounded-xl text-[#2e2236]  pl-[10px]"
                    rows={5}
                    name="message"
                    value={mailMessage}
                    onChange={(e) => setMailMessage(e.target.value)}
                    required
                  ></textarea>

                  <div className="flex flex-row form-check mt-8 items-center">
                    <input
                      id="flexCheckDefault"
                      type="checkbox"
                      defaultChecked={false}
                      //value={checkBox}
                      onChange={handleCheckBox}
                      required
                      className="rounded-xl w-[25px] h-[25px] lg:h-[30px]"
                    />

                    <label
                      className="form-check-label text-[25px] lg:text-[25px] ml-[15px] mt-[7px]"
                      htmlFor="flexCheckDefault"
                    >
                      {t('contactAgree')}{' '}
                      <button className="underline" onClick={(e) => toggleShowGdpr(e)}>
                        {t('contactGdpr')}{' '}
                      </button>
                      {showGdpr && (
                        <p className="w-[300px] lg:w-[240px] text-[22.5px] text-left mt-2 leading-6">
                          {t('gdpr1')}
                        </p>
                      )}
                    </label>
                  </div>
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
                  className="text-[25px] bg-violet mt-10 pt-[5px] rounded-xl border border-white hover:bg-green-500"
                  type="submit"
                  value="Send"
                >
                  {t('contactSend')}
                </button>
              </form>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Contact
