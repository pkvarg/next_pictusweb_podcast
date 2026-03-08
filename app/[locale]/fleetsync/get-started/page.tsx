'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'
import { CheckCircle, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, Building2, UserPlus, ShieldCheck, FileCheck, CreditCard } from 'lucide-react'

const STEPS = ['organization', 'account', 'verification', 'agreements', 'review'] as const
type Step = (typeof STEPS)[number]

interface FormData {
  // Step 1 - Organization
  organizationName: string
  organizationContact: string
  ico: string
  dic: string
  street: string
  city: string
  postalCode: string
  country: string
  numberOfVehicles: number
  // Step 2 - Account
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
  // Step 3 - Verification
  emailCode: string
  phoneCode: string
  emailVerified: boolean
  phoneVerified: boolean
  // Step 4 - Agreements
  gdprAccepted: boolean
  termsAccepted: boolean
}

function GetStartedContent() {
  const searchParams = useSearchParams()
  const t = useTranslations('FleetSyncOnboarding')

  const tierParam = searchParams.get('tier')?.toUpperCase() || 'FREE'
  const billingParam = searchParams.get('billing') || 'monthly'
  const tier = ['FREE', 'BASIC', 'BUSINESS'].includes(tierParam) ? tierParam : 'FREE'
  const isFree = tier === 'FREE'
  const [billing, setBilling] = useState<'monthly' | 'yearly'>(billingParam === 'yearly' ? 'yearly' : 'monthly')

  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [verificationSent, setVerificationSent] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [emailToken, setEmailToken] = useState('')
  const [phoneToken, setPhoneToken] = useState('')
  const [pricingData, setPricingData] = useState<{ name: string; pricePerVehicle: number; pricePerVehicleYearly: number | null; yearlyDiscount: number; vehiclesLimit: number }[]>([])

  const [form, setForm] = useState<FormData>({
    organizationName: '',
    organizationContact: '',
    ico: '',
    dic: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
    numberOfVehicles: tier === 'BUSINESS' ? 4 : 1,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    emailCode: '',
    phoneCode: '',
    emailVerified: false,
    phoneVerified: false,
    gdprAccepted: false,
    termsAccepted: false,
  })

  // Restore form data from sessionStorage (e.g. after Stripe cancel)
  useEffect(() => {
    const saved = sessionStorage.getItem('fleetsync-onboarding-form')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setForm(parsed.form)
        setCurrentStep(parsed.step ?? 0)
        setVerificationSent(parsed.verificationSent ?? false)
        if (parsed.billing) setBilling(parsed.billing)
      } catch {}
      sessionStorage.removeItem('fleetsync-onboarding-form')
    }
  }, [])

  // Fetch pricing from database
  useEffect(() => {
    fetch('/api/tiers/pricing')
      .then((res) => res.json())
      .then((data) => { if (data.pricing) setPricingData(data.pricing) })
      .catch(() => {})
  }, [])

  // Price calculation from DB
  const tierPricing = pricingData.find((p) => p.name === tier)
  const pricePerVehicle = tierPricing?.pricePerVehicle ?? (tier === 'BASIC' ? 2 : tier === 'BUSINESS' ? 3 : 0)
  const yearlyDiscount = tierPricing?.yearlyDiscount ?? 0.83
  const maxVehicles = tierPricing?.vehiclesLimit ?? 999
  const pricePerVehicleYearly = tierPricing?.pricePerVehicleYearly ?? null
  const totalPrice = isFree
    ? 0
    : billing === 'yearly'
      ? pricePerVehicleYearly != null
        ? +(pricePerVehicleYearly * form.numberOfVehicles).toFixed(2)
        : +(pricePerVehicle * 12 * yearlyDiscount * form.numberOfVehicles).toFixed(2)
      : pricePerVehicle * form.numberOfVehicles

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const updateForm = (field: keyof FormData, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const fullPhoneNumber = `+421${form.phoneNumber.replace(/\s/g, '')}`

  // Email availability check
  const checkEmail = async (email: string): Promise<boolean | null> => {
    if (!email || !email.includes('@')) {
      setEmailAvailable(null)
      return null
    }
    setEmailCheckLoading(true)
    try {
      const res = await fetch('/api/fleetsync/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setEmailAvailable(data.available)
      return data.available as boolean
    } catch {
      setEmailAvailable(null)
      return null
    } finally {
      setEmailCheckLoading(false)
    }
  }

  // Send verification codes
  const sendVerificationCodes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/fleetsync/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          phoneNumber: fullPhoneNumber,
          firstName: form.firstName,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.emailToken) setEmailToken(data.emailToken)
        if (data.phoneToken) setPhoneToken(data.phoneToken)
        setVerificationSent(true)
        setResendCooldown(60)
      }
    } catch {
      setError(t('verificationSendError'))
    } finally {
      setLoading(false)
    }
  }

  // Verify codes
  const verifyCodes = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/fleetsync/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          phoneNumber: fullPhoneNumber,
          emailCode: form.emailCode,
          phoneCode: form.phoneCode,
          emailToken,
          phoneToken,
        }),
      })
      const data = await res.json()
      if (data.emailVerified && data.phoneVerified) {
        updateForm('emailVerified', true)
        updateForm('phoneVerified', true)
        return true
      } else {
        setError(t('verificationInvalid'))
        return false
      }
    } catch {
      setError(t('verificationError'))
      return false
    } finally {
      setLoading(false)
    }
  }

  // Dev-only skip — jumps from account step directly to agreements (skips verification)
  const skipVerification = () => {
    updateForm('emailVerified', true)
    updateForm('phoneVerified', true)
    setCurrentStep((prev) => Math.min(prev + 2, STEPS.length - 1))
  }

  // Validation per step
  const validateStep = (): string | null => {
    switch (STEPS[currentStep]) {
      case 'organization':
        if (!form.firstName.trim()) return t('errorFirstName')
        if (!form.lastName.trim()) return t('errorLastName')
        if (!form.street.trim() || !form.city.trim() || !form.postalCode.trim()) return t('errorAddress')
        if (!form.country.trim()) return t('errorCountry')
        if (!isFree && form.numberOfVehicles < 1) return t('errorVehicles')
        return null
      case 'account':
        if (!form.email.includes('@')) return t('errorEmail')
        if (emailAvailable !== true) return t('errorEmailTaken')
        if (!form.phoneNumber.trim()) return t('errorPhone')
        if (form.password.length < 8) return t('errorPasswordLength')
        if (form.password !== form.confirmPassword) return t('errorPasswordMatch')
        return null
      case 'verification':
        if (!form.emailVerified || !form.phoneVerified) return t('errorVerification')
        return null
      case 'agreements':
        if (!form.gdprAccepted) return t('errorGdpr')
        if (!form.termsAccepted) return t('errorTerms')
        return null
      default:
        return null
    }
  }

  const handleNext = async () => {
    // Force email availability re-check on account step before validating
    if (STEPS[currentStep] === 'account' && form.email.includes('@')) {
      const available = await checkEmail(form.email)
      if (available !== true) {
        setError(t('errorEmailTaken'))
        return
      }
    }

    // Skip standard validation for verification step — verifyCodes handles it
    if (STEPS[currentStep] !== 'verification') {
      const validationError = validateStep()
      if (validationError) {
        setError(validationError)
        return
      }
    }

    // Auto-generate organizationName from firstName + lastName if left empty
    if (STEPS[currentStep] === 'organization' && !form.organizationName.trim()) {
      const generated = `${form.firstName}${form.lastName}`.replace(/\s/g, '').toUpperCase()
      updateForm('organizationName', generated)
    }

    // Auto-prefill account email from organizationContact if email is still empty
    if (STEPS[currentStep] === 'organization' && form.organizationContact.trim() && !form.email.trim()) {
      updateForm('email', form.organizationContact.trim())
    }

    // When entering verification step, auto-send codes
    if (STEPS[currentStep] === 'account' && !verificationSent) {
      await sendVerificationCodes()
    }

    // When leaving verification step, verify codes first
    if (STEPS[currentStep] === 'verification') {
      if (!form.emailCode || !form.phoneCode) {
        setError(t('errorVerification'))
        return
      }
      const verified = await verifyCodes()
      if (!verified) return
    }

    setError('')
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    setError('')
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  // Submit (final step)
  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      if (isFree) {
        const res = await fetch('/api/fleetsync/onboard-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationName: form.organizationName,
            organizationContact: form.organizationContact,
            ico: form.ico,
            dic: form.dic,
            street: form.street,
            city: form.city,
            postalCode: form.postalCode,
            country: form.country,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            phoneNumber: fullPhoneNumber,
          }),
        })
        const data = await res.json()
        if (data.success) {
          sessionStorage.removeItem('fleetsync-onboarding-form')
          window.location.href = `/${window.location.pathname.split('/')[1]}/fleetsync/get-started/success?tier=FREE`
        } else {
          setError(data.error || t('submitError'))
        }
      } else {
        const res = await fetch('/api/fleetsync/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationName: form.organizationName,
            organizationContact: form.organizationContact,
            ico: form.ico,
            dic: form.dic,
            street: form.street,
            city: form.city,
            postalCode: form.postalCode,
            country: form.country,
            tier,
            purchasedVehicles: form.numberOfVehicles,
            billingInterval: billing,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            phoneNumber: fullPhoneNumber,
          }),
        })
        const data = await res.json()
        if (data.checkoutUrl) {
          sessionStorage.setItem('fleetsync-onboarding-form', JSON.stringify({
            form,
            step: currentStep,
            verificationSent,
            billing,
          }))
          window.location.href = data.checkoutUrl
        } else {
          setError(data.error || t('submitError'))
        }
      }
    } catch {
      setError(t('submitError'))
    } finally {
      setLoading(false)
    }
  }

  const stepIcons = [Building2, UserPlus, ShieldCheck, FileCheck, CreditCard]

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-10 gap-1">
      {STEPS.map((step, i) => {
        const Icon = stepIcons[i]
        const isActive = i === currentStep
        const isDone = i < currentStep
        return (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black'
                  : isDone
                    ? 'bg-green-600 text-white'
                    : 'bg-pictus-white/10 text-gray-500'
              }`}
            >
              {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 lg:w-16 h-0.5 ${isDone ? 'bg-green-600' : 'bg-pictus-white/10'}`} />
            )}
          </div>
        )
      })}
    </div>
  )

  const inputClass =
    'w-full px-4 py-3 bg-pictus-white/5 border border-pictus-white/10 rounded-lg text-pictus-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent transition-all'
  const labelClass = 'block text-sm font-light text-gray-400 mb-1'

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      // ─── Step 1: Organization ───
      case 'organization':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-pictus-white">{t('step1Title')}</h2>
            <p className="text-gray-400 font-light">{t('step1Subtitle')}</p>

            {/* Tier info card */}
            <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 border border-pictus-lime/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-400">{t('selectedTier')}</span>
                  <p className="text-xl font-normal text-pictus-lime">{tier}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-400">{t('billing')}</span>
                  {isFree ? (
                    <p className="text-lg font-normal text-pictus-white">{t('freeForever')}</p>
                  ) : (
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setBilling('monthly')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        billing === 'monthly'
                          ? 'bg-pictus-lime text-pictus-black font-normal'
                          : 'bg-pictus-white/10 text-gray-400 hover:bg-pictus-white/20'
                      }`}
                    >
                      {t('monthly')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBilling('yearly')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        billing === 'yearly'
                          ? 'bg-pictus-lime text-pictus-black font-normal'
                          : 'bg-pictus-white/10 text-gray-400 hover:bg-pictus-white/20'
                      }`}
                    >
                      {t('yearly')}
                    </button>
                  </div>
                )}
              </div>
              </div>
              {isFree && (
                <p className="mt-3 text-xs text-yellow-400/80 flex items-start gap-1.5">
                  <span className="flex-shrink-0">⚠</span>
                  {t('freePlanLimit')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('firstName')} *</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.firstName}
                  onChange={(e) => updateForm('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>{t('lastName')} *</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.lastName}
                  onChange={(e) => updateForm('lastName', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('orgName')}</label>
              <input
                type="text"
                className={inputClass}
                value={form.organizationName}
                onChange={(e) => updateForm('organizationName', e.target.value)}
                placeholder={t('orgNamePlaceholder')}
                maxLength={100}
              />
              <p className="text-sm text-gray-500 mt-1 font-light">{t('orgNameAutoHint')}</p>
            </div>

            <div>
              <label className={labelClass}>{t('orgContact')}</label>
              <input
                type="email"
                className={inputClass}
                value={form.organizationContact}
                onChange={(e) => updateForm('organizationContact', e.target.value)}
                placeholder={t('orgContactPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('ico')}</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.ico}
                  onChange={(e) => updateForm('ico', e.target.value)}
                  placeholder={t('icoPlaceholder')}
                  maxLength={20}
                />
              </div>
              <div>
                <label className={labelClass}>{t('dic')}</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.dic}
                  onChange={(e) => updateForm('dic', e.target.value)}
                  placeholder={t('dicPlaceholder')}
                  maxLength={20}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('street')} *</label>
              <input
                type="text"
                className={inputClass}
                value={form.street}
                onChange={(e) => updateForm('street', e.target.value)}
                placeholder={t('streetPlaceholder')}
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className={labelClass}>{t('postalCode')} *</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.postalCode}
                  onChange={(e) => updateForm('postalCode', e.target.value)}
                  placeholder={t('postalCodePlaceholder')}
                  maxLength={20}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>{t('city')} *</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.city}
                  onChange={(e) => updateForm('city', e.target.value)}
                  placeholder={t('cityPlaceholder')}
                  maxLength={100}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('country')} *</label>
              <input
                type="text"
                className={inputClass}
                value={form.country}
                onChange={(e) => updateForm('country', e.target.value)}
                placeholder={t('countryPlaceholder')}
                maxLength={100}
              />
            </div>

            {!isFree && (
              <div>
                <label className={labelClass}>{t('numberOfVehicles')} * (max {maxVehicles})</label>
                <input
                  type="number"
                  min={1}
                  max={maxVehicles}
                  className={inputClass}
                  value={form.numberOfVehicles}
                  onChange={(e) => updateForm('numberOfVehicles', Math.min(maxVehicles, Math.max(1, parseInt(e.target.value) || 1)))}
                />
                <p className="text-sm text-gray-400 mt-2 font-light">
                  {t('priceCalculation')}: {form.numberOfVehicles} x €{billing === 'yearly' && pricePerVehicleYearly != null ? pricePerVehicleYearly : pricePerVehicle}/{billing === 'yearly' ? t('year') : t('month')}
                  {billing === 'yearly' && pricePerVehicleYearly == null && <> x 12 x {yearlyDiscount} ({Math.round((1 - yearlyDiscount) * 100)}% {t('discount')})</>}
                  {' '}= <span className="text-pictus-lime font-normal">€{totalPrice}/{billing === 'yearly' ? t('year') : t('month')}</span>
                </p>
              </div>
            )}
          </div>
        )

      // ─── Step 2: Account ───
      case 'account':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-pictus-white">{t('step2Title')}</h2>
            <p className="text-gray-400 font-light">{t('step2Subtitle')}</p>

            <div>
              <label className={labelClass}>{t('email')} *</label>
              <div className="relative">
                <input
                  type="email"
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => {
                    updateForm('email', e.target.value)
                    setEmailAvailable(null)
                  }}
                  onBlur={() => checkEmail(form.email)}
                />
                {emailCheckLoading && (
                  <Loader2 className="absolute right-3 top-3.5 w-5 h-5 animate-spin text-gray-400" />
                )}
                {emailAvailable === true && (
                  <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-400" />
                )}
                {emailAvailable === false && (
                  <span className="text-red-400 text-sm mt-1 block">{t('emailTaken')}</span>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>{t('phoneNumber')} *</label>
              <div className="flex gap-2">
                <span className="flex items-center px-4 py-3 bg-pictus-white/5 border border-pictus-white/10 rounded-lg text-gray-400 font-light text-sm select-none">+421</span>
                <input
                  type="tel"
                  className={inputClass}
                  value={form.phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d\s]/g, '')
                    updateForm('phoneNumber', val)
                  }}
                  placeholder="9XX XXX XXX"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1 font-light">
                {t('phoneSkOnly')}{' '}
{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <Link href="/contact" className="text-pictus-lime hover:text-pictus-lime600 underline transition-colors">{t('phoneSkContact')}</Link>
              </p>
            </div>

            <div>
              <label className={labelClass}>{t('password')} *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={inputClass}
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-pictus-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1 font-light">{t('passwordHint')}</p>
            </div>

            <div>
              <label className={labelClass}>{t('confirmPassword')} *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={inputClass}
                  value={form.confirmPassword}
                  onChange={(e) => updateForm('confirmPassword', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-pictus-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {process.env.NEXT_PUBLIC_SKIP_VERIFICATION === 'true' && (
              <button
                type="button"
                onClick={skipVerification}
                className="w-full border border-yellow-500/50 text-yellow-400 py-2 rounded-lg text-sm font-light hover:bg-yellow-500/10 transition-colors mt-2"
              >
                [DEV] Preskočiť overenie
              </button>
            )}
          </div>
        )

      // ─── Step 3: Verification ───
      case 'verification':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-pictus-white">{t('step3Title')}</h2>
            <p className="text-gray-400 font-light">{t('step3Subtitle')}</p>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300 font-light">
              {t('verificationInfo')}
            </div>

            <div>
              <label className={labelClass}>{t('emailCode')}</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  maxLength={6}
                  className={`${inputClass} tracking-[0.5em] text-center text-lg font-mono`}
                  value={form.emailCode}
                  onChange={(e) => updateForm('emailCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                />
              </div>
              {form.emailVerified && (
                <p className="text-green-400 text-sm mt-1 flex items-center gap-1 font-light">
                  <CheckCircle className="w-4 h-4" /> {t('emailVerifiedLabel')}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>{t('phoneCodeLabel')}</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  maxLength={6}
                  className={`${inputClass} tracking-[0.5em] text-center text-lg font-mono`}
                  value={form.phoneCode}
                  onChange={(e) => updateForm('phoneCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                />
              </div>
              {form.phoneVerified && (
                <p className="text-green-400 text-sm mt-1 flex items-center gap-1 font-light">
                  <CheckCircle className="w-4 h-4" /> {t('phoneVerifiedLabel')}
                </p>
              )}
            </div>

            <button
              onClick={sendVerificationCodes}
              disabled={resendCooldown > 0 || loading}
              className="text-pictus-lime hover:text-pictus-lime600 text-sm font-light disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {resendCooldown > 0 ? `${t('resendIn')} ${resendCooldown}s` : t('resendCodes')}
            </button>

          </div>
        )

      // ─── Step 4: Agreements ───
      case 'agreements':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-pictus-white">{t('step4Title')}</h2>
            <p className="text-gray-400 font-light">{t('step4Subtitle')}</p>

            <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl border border-pictus-white/10 hover:border-pictus-lime/30 transition-colors bg-pictus-white/5">
              <input
                type="checkbox"
                checked={form.gdprAccepted}
                onChange={(e) => updateForm('gdprAccepted', e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-500 text-pictus-lime focus:ring-pictus-lime bg-pictus-white/5 flex-shrink-0 accent-[#B6E036]"
              />
              <span className="text-gray-300 font-light">
                {t('gdprAgree')}{' '}
                <a
                  href="/contact#gdpr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pictus-lime hover:text-pictus-lime600 underline transition-colors"
                >
                  {t('gdprLink')}
                </a>
                {' *'}
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group p-4 rounded-xl border border-pictus-white/10 hover:border-pictus-lime/30 transition-colors bg-pictus-white/5">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) => updateForm('termsAccepted', e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-500 text-pictus-lime focus:ring-pictus-lime bg-pictus-white/5 flex-shrink-0 accent-[#B6E036]"
              />
              <span className="text-gray-300 font-light">
                {t('termsAgree')}{' '}
                <a
                  href="/contact#trade-rules"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pictus-lime hover:text-pictus-lime600 underline transition-colors"
                >
                  {t('termsLink')}
                </a>
                {' *'}
              </span>
            </label>
          </div>
        )

      // ─── Step 5: Review ───
      case 'review':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-pictus-white">{t('step5Title')}</h2>
            <p className="text-gray-400 font-light">{t('step5Subtitle')}</p>

            {/* Organization Summary */}
            <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 rounded-xl p-5 space-y-3 border border-pictus-lime/30 backdrop-blur-sm">
              <h3 className="text-lg font-light flex items-center gap-2">
                <Building2 className="w-5 h-5 text-pictus-lime" />
                {t('reviewOrganization')}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm font-light">
                <div className="text-gray-400">{t('orgName')}</div>
                <div className="text-pictus-white">{form.organizationName}</div>
                {form.organizationContact && (
                  <>
                    <div className="text-gray-400">{t('orgContact')}</div>
                    <div className="text-pictus-white">{form.organizationContact}</div>
                  </>
                )}
                {form.ico && (
                  <>
                    <div className="text-gray-400">{t('ico')}</div>
                    <div className="text-pictus-white">{form.ico}</div>
                  </>
                )}
                {form.dic && (
                  <>
                    <div className="text-gray-400">{t('dic')}</div>
                    <div className="text-pictus-white">{form.dic}</div>
                  </>
                )}
                <div className="text-gray-400">{t('address')}</div>
                <div className="text-pictus-white">{form.street}, {form.postalCode} {form.city}, {form.country}</div>
                <div className="text-gray-400">{t('selectedTier')}</div>
                <div className="text-pictus-lime">{tier}</div>
                <div className="text-gray-400">{t('billing')}</div>
                <div className="text-pictus-white">{isFree ? t('freeForever') : billing === 'yearly' ? t('yearly') : t('monthly')}</div>
                {!isFree && (
                  <>
                    <div className="text-gray-400">{t('numberOfVehicles')}</div>
                    <div className="text-pictus-white">{form.numberOfVehicles}</div>
                    <div className="text-gray-400">{t('totalPrice')}</div>
                    <div className="text-pictus-lime font-normal">
                      €{totalPrice}/{billing === 'yearly' ? t('year') : t('month')}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* User Summary */}
            <div className="bg-gradient-to-br from-pictus-onyx900/50 to-pictus-black/80 rounded-xl p-5 space-y-3 border border-pictus-lime/30 backdrop-blur-sm">
              <h3 className="text-lg font-light flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-pictus-lime" />
                {t('reviewAccount')}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm font-light">
                <div className="text-gray-400">{t('fullName')}</div>
                <div className="text-pictus-white">{form.firstName} {form.lastName}</div>
                <div className="text-gray-400">{t('email')}</div>
                <div className="text-pictus-white">{form.email}</div>
                <div className="text-gray-400">{t('phoneNumber')}</div>
                <div className="text-pictus-white">{fullPhoneNumber}</div>
              </div>
            </div>

            {/* Verification & Agreements */}
            <div className="bg-pictus-white/5 rounded-xl p-5 space-y-2 border border-pictus-white/10">
              <div className="flex items-center gap-2 text-sm font-light">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-pictus-white">{t('emailVerifiedLabel')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-light">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-pictus-white">{t('phoneVerifiedLabel')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-light">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-pictus-white">{t('gdprAcceptedLabel')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-light">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-pictus-white">{t('termsAcceptedLabel')}</span>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white font-brutal-milk">
      <PagesHeader />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to pricing */}
        <Link
          href="/fleetsync"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-pictus-lime mb-8 transition-colors font-light"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToPricing')}
        </Link>

        <h1 className="text-3xl lg:text-4xl font-light mb-2 text-pictus-white">{t('pageTitle')}</h1>
        <p className="text-gray-400 mb-8 font-light">{t('pageSubtitle')}</p>

        {renderStepIndicator()}

        {/* Error display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg mb-6 font-light">
            {error}
          </div>
        )}

        {/* Step content */}
        <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-pictus-lime/30">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {currentStep === 0 ? (
            <Link
              href="/fleetsync"
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-pictus-white/10 text-pictus-white hover:bg-pictus-white/20 transition-all font-light"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToPricing')}
            </Link>
          ) : (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-pictus-white/10 text-pictus-white hover:bg-pictus-white/20 transition-all font-light"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('back')}
            </button>
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all shadow-lg hover:shadow-pictus-lime/50 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {t('next')}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all shadow-lg hover:shadow-pictus-lime/50 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isFree ? t('createAccount') : t('proceedToPayment')}
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function GetStartedPage() {
  return (
    <Suspense>
      <GetStartedContent />
    </Suspense>
  )
}
