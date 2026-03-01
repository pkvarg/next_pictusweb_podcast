'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
  FileText,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface Tier {
  id: string
  name: string
  usersLimit: number
  vehiclesLimit: number
  notificationsLimit: number
  templatesLimit: number
  notificationTypesLimit: number
  pricePerVehicle?: number | null
  pricePerVehicleYearly?: number | null
  yearlyDiscount?: number | null
}

type Step = 1 | 2 | 3

const OnboardClientPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Tiers
  const [tiers, setTiers] = useState<Tier[]>([])
  const [tiersLoading, setTiersLoading] = useState(true)

  // Step 1: Organization data
  const [organizationName, setOrganizationName] = useState('')
  const [organizationMainContact, setOrganizationMainContact] = useState('')
  const [selectedTierId, setSelectedTierId] = useState('')
  const [purchasedVehicles, setPurchasedVehicles] = useState('')
  const [showCustomLimits, setShowCustomLimits] = useState(false)
  const [customUsersLimit, setCustomUsersLimit] = useState('')
  const [customVehiclesLimit, setCustomVehiclesLimit] = useState('')
  const [customNotificationsLimit, setCustomNotificationsLimit] = useState('')
  const [customTemplatesLimit, setCustomTemplatesLimit] = useState('')
  const [customNotificationTypesLimit, setCustomNotificationTypesLimit] = useState('')
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [skipPayment, setSkipPayment] = useState(false)

  // Step 1: Address / invoicing fields (shown directly in form, like self-service)
  const [ico, setIco] = useState('')
  const [dic, setDic] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('Slovensko')

  // Step 2: User data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')  // stored WITHOUT +421 prefix
  const [isFleetManager, setIsFleetManager] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const fullPhoneNumber = phoneNumber.trim() ? `+421${phoneNumber.replace(/\s/g, '')}` : ''

  // Fakturačné údaje
  const [showInvoicingForm, setShowInvoicingForm] = useState(false)
  const [invoicingSubmitting, setInvoicingSubmitting] = useState(false)
  const [invoicingSuccess, setInvoicingSuccess] = useState(false)
  const [invoicingError, setInvoicingError] = useState('')
  const [invoicingData, setInvoicingData] = useState({
    companyName: '',
    ico: '',
    dic: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
    contactEmail: '',
    contactPhone: '',
    contactPerson: '',
    note: '',
    numberOfVehicles: '',
    tierName: '',
  })

  const handleInvoicingChange = (field: string, value: string) => {
    setInvoicingData((prev) => ({ ...prev, [field]: value }))
    if (field === 'companyName') {
      setOrganizationName(value)
    }
    if (field === 'contactEmail') {
      setOrganizationMainContact(value)
      setEmail(value)
    }
    if (field === 'contactPerson') {
      const parts = value.trim().split(/\s+/)
      if (parts.length >= 2) {
        setFirstName(parts[0])
        setLastName(parts.slice(1).join(' '))
      } else {
        setFirstName(value)
        setLastName('')
      }
      // If company name is empty, use contact person as org name
      if (!invoicingData.companyName.trim()) {
        setOrganizationName(value)
      }
    }
    if (field === 'numberOfVehicles') {
      setPurchasedVehicles(value)
    }
    if (field === 'tierName') {
      const matchedTier = tiers.find((t) => t.name === value)
      if (matchedTier) {
        setSelectedTierId(matchedTier.id)
      }
    }
    if (field === 'contactPhone') {
      setPhoneNumber(value.replace(/[^\d\s]/g, ''))
    }
    // Sync address fields
    if (field === 'ico') setIco(value)
    if (field === 'dic') setDic(value)
    if (field === 'street') setStreet(value)
    if (field === 'city') setCity(value)
    if (field === 'postalCode') setPostalCode(value)
    if (field === 'country') setCountry(value)
  }

  const handleInvoicingSubmit = async () => {
    setInvoicingError('')

    if (!invoicingData.contactPerson.trim()) {
      setInvoicingError('Kontaktná osoba je povinná')
      return
    }
    if (
      !invoicingData.street.trim() ||
      !invoicingData.city.trim() ||
      !invoicingData.postalCode.trim()
    ) {
      setInvoicingError('Adresa (ulica, mesto, PSČ) je povinná')
      return
    }
    if (!invoicingData.country.trim()) {
      setInvoicingError('Krajina je povinná')
      return
    }
    if (!invoicingData.contactEmail.trim() || !invoicingData.contactEmail.includes('@')) {
      setInvoicingError('Zadajte platný kontaktný email')
      return
    }

    setInvoicingSubmitting(true)

    try {
      const response = await fetch('/api/invoicing-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoicingData,
          organizationName: organizationName || '',
          submittedBy: session?.user?.email || '',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Nepodarilo sa odoslať fakturačné údaje')
      }

      setInvoicingSuccess(true)
    } catch (err) {
      setInvoicingError(
        err instanceof Error ? err.message : 'Nepodarilo sa odoslať fakturačné údaje',
      )
    } finally {
      setInvoicingSubmitting(false)
    }
  }

  // Check if user is PICTUSACI
  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/login')
      return
    }

    // Check if user is from PICTUSACI - will be verified server-side as well
    const checkPictusaciUser = async () => {
      try {
        const orgId = (session.user as any).organizationId || session.user.organization
        if (!orgId) {
          router.push('/client/my-fleet')
          return
        }

        const response = await fetch(`/api/organizations?id=${orgId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.organizations?.[0]?.name !== 'PICTUSACI') {
            router.push('/client/my-fleet')
          }
        } else {
          router.push('/client/my-fleet')
        }
      } catch (err) {
        console.error('Error checking organization:', err)
        router.push('/client/my-fleet')
      }
    }

    checkPictusaciUser()
  }, [session, status, router])

  // Fetch tiers
  useEffect(() => {
    const fetchTiers = async () => {
      try {
        setTiersLoading(true)
        const response = await fetch('/api/tiers')
        if (response.ok) {
          const data = await response.json()
          setTiers(data.tiers || [])
        }
      } catch (err) {
        console.error('Error fetching tiers:', err)
      } finally {
        setTiersLoading(false)
      }
    }

    fetchTiers()
  }, [])

  const validateStep1 = () => {
    // organizationName is optional — auto-generated from firstName+lastName if empty
    if (!selectedTierId) {
      setError('Vyberte tier')
      return false
    }
    if (!street.trim() || !city.trim() || !postalCode.trim()) {
      setError('Adresa (ulica, mesto, PSČ) je povinná')
      return false
    }
    if (!country.trim()) {
      setError('Krajina je povinná')
      return false
    }
    const selectedTier = getSelectedTier()
    const isPaid = selectedTier && selectedTier.name !== 'FREE'
    if (isPaid && (!purchasedVehicles || Number(purchasedVehicles) < 1)) {
      setError('Zadajte počet zakúpených vozidiel (min. 1)')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Meno a priezvisko sú povinné')
      return false
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Zadajte platný email')
      return false
    }
    if (password.length < 8) {
      setError('Heslo musí mať aspoň 8 znakov')
      return false
    }
    if (password !== confirmPassword) {
      setError('Heslá sa nezhodujú')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setError('')

    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      // Auto-generate organizationName from firstName + lastName if left empty
      if (!organizationName.trim()) {
        const generated = `${firstName}${lastName}`.replace(/\s/g, '').toUpperCase()
        setOrganizationName(generated)
      }
      setCurrentStep(3)
    }
  }

  const handlePrevStep = () => {
    setError('')
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    const selectedTier = getSelectedTier()
    const tierName = selectedTier?.name?.toUpperCase() || ''
    const isPaidTier = tierName === 'BASIC' || tierName === 'BUSINESS'
    const requirePayment = isPaidTier && !(tierName === 'BASIC' && skipPayment)

    try {
      const payload = {
        organizationName,
        organizationMainContact,
        ico: ico || null,
        dic: dic || null,
        street: street || null,
        city: city || null,
        postalCode: postalCode || null,
        country: country || null,
        tierId: selectedTierId,
        purchasedVehicles: purchasedVehicles ? Number(purchasedVehicles) : null,
        usersLimit: customUsersLimit ? Number(customUsersLimit) : null,
        vehiclesLimit: customVehiclesLimit ? Number(customVehiclesLimit) : null,
        notificationsLimit: customNotificationsLimit ? Number(customNotificationsLimit) : null,
        templatesLimit: customTemplatesLimit ? Number(customTemplatesLimit) : null,
        notificationTypesLimit: customNotificationTypesLimit
          ? Number(customNotificationTypesLimit)
          : null,
        firstName,
        lastName,
        email,
        password,
        phoneNumber: fullPhoneNumber || null,
        isFleetManager,
        billingInterval,
        requirePayment,
      }

      const response = await fetch('/api/onboard-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to onboard client')
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
        return
      }

      setSuccess(true)

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/client/my-fleet?tab=organizations')
      }, 2000)
    } catch (err) {
      console.error('Error onboarding client:', err)
      setError(err instanceof Error ? err.message : 'Failed to onboard client')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedTier = () => tiers.find((t) => t.id === selectedTierId)

  if (status === 'loading' || tiersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pictus-lime"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-4xl font-light mb-4">Klient úspešne onboardovaný!</h2>
          <p className="text-pictus-lime text-xl">Presmerovanie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white font-brutal-milk">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/client/my-fleet"
            className="inline-flex items-center gap-2 text-pictus-lime hover:text-pictus-lime-200 transition-colors text-lg"
          >
            <ArrowLeft size={20} />
            Späť na správu flotily
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-pictus-lime" />
            <h1 className="text-5xl font-light text-pictus-white">Onboarding nového klienta</h1>
          </div>
          <p className="text-xl text-pictus-white/70">
            Vytvorte novú organizáciu a priraďte používateľa
          </p>
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg max-w-2xl mx-auto">
            <p className="text-blue-300 text-base">
              📄 Pošli klientovi súhlas s GDPR tu:{' '}
              <a
                href="https://docuseal.pictusweb.sk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pictus-lime hover:text-pictus-lime400 underline transition-colors"
              >
                https://docuseal.pictusweb.sk/
              </a>
            </p>
          </div>

          {/* Fakturačné údaje */}
          <div className="mt-6 max-w-2xl mx-auto">
            <button
              onClick={() => setShowInvoicingForm(!showInvoicingForm)}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-pictus-lime" />
                <span className="text-lg text-pictus-white">Fakturačné údaje</span>
                {invoicingSuccess && (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle size={16} /> Odoslané
                  </span>
                )}
              </div>
              {showInvoicingForm ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showInvoicingForm && (
              <div className="mt-2 p-6 bg-white/5 border border-white/10 rounded-lg space-y-4">
                {invoicingSuccess ? (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-green-300 text-lg">
                      Fakturačné údaje boli úspešne odoslané!
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm mb-2">
                      Vyplň fakturačné údaje klienta. Údaje budú odoslané na spracovanie.
                    </p>
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-300 text-sm font-medium">
                        INFO: Pictusweb s.r.o. nie je platcom DPH
                      </p>
                    </div>

                    {invoicingError && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        <p className="text-red-200 text-sm">{invoicingError}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Kontaktná osoba *
                      </label>
                      <input
                        type="text"
                        value={invoicingData.contactPerson}
                        onChange={(e) => handleInvoicingChange('contactPerson', e.target.value)}
                        placeholder="napr. Ján Novák"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Názov firmy
                      </label>
                      <input
                        type="text"
                        value={invoicingData.companyName}
                        onChange={(e) => handleInvoicingChange('companyName', e.target.value)}
                        placeholder="napr. ABC Company s.r.o."
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">IČO</label>
                        <input
                          type="text"
                          value={invoicingData.ico}
                          onChange={(e) => handleInvoicingChange('ico', e.target.value)}
                          placeholder="12345678"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">DIČ</label>
                        <input
                          type="text"
                          value={invoicingData.dic}
                          onChange={(e) => handleInvoicingChange('dic', e.target.value)}
                          placeholder="2012345678"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Ulica a číslo *
                      </label>
                      <input
                        type="text"
                        value={invoicingData.street}
                        onChange={(e) => handleInvoicingChange('street', e.target.value)}
                        placeholder="napr. Hlavná 123"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Mesto *
                        </label>
                        <input
                          type="text"
                          value={invoicingData.city}
                          onChange={(e) => handleInvoicingChange('city', e.target.value)}
                          placeholder="Bratislava"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          PSČ *
                        </label>
                        <input
                          type="text"
                          value={invoicingData.postalCode}
                          onChange={(e) => handleInvoicingChange('postalCode', e.target.value)}
                          placeholder="81101"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Krajina *
                        </label>
                        <input
                          type="text"
                          value={invoicingData.country}
                          onChange={(e) => handleInvoicingChange('country', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Kontaktný email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={invoicingData.contactEmail}
                            onChange={(e) => handleInvoicingChange('contactEmail', e.target.value)}
                            placeholder="fakturacia@firma.sk"
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Kontaktný telefón
                        </label>
                        <div className="flex gap-2">
                          <span className="flex items-center px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 font-light text-sm select-none">+421</span>
                          <input
                            type="tel"
                            value={invoicingData.contactPhone}
                            onChange={(e) => handleInvoicingChange('contactPhone', e.target.value.replace(/[^\d\s]/g, ''))}
                            placeholder="9XX XXX XXX"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Počet vozidiel
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={invoicingData.numberOfVehicles}
                          onChange={(e) => handleInvoicingChange('numberOfVehicles', e.target.value)}
                          placeholder="napr. 10"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Tier
                        </label>
                        <select
                          value={invoicingData.tierName}
                          onChange={(e) => handleInvoicingChange('tierName', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime transition-all"
                        >
                          <option value="">Vyberte tier</option>
                          {tiers.map((tier) => (
                            <option key={tier.id} value={tier.name}>
                              {tier.name} {tier.pricePerVehicle != null && Number(tier.pricePerVehicle) > 0 ? `(${tier.pricePerVehicle} €/voz/mes)` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Poznámka
                      </label>
                      <textarea
                        value={invoicingData.note}
                        onChange={(e) => handleInvoicingChange('note', e.target.value)}
                        rows={3}
                        placeholder="Info k fakturácii..."
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all resize-none"
                      />
                    </div>

                    <button
                      onClick={handleInvoicingSubmit}
                      disabled={invoicingSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black rounded-lg hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {invoicingSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-pictus-black border-t-transparent" />
                          Odosielam...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Odoslať fakturačné údaje
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    currentStep >= step
                      ? 'bg-pictus-lime border-pictus-lime text-pictus-black'
                      : 'bg-transparent border-gray-500 text-gray-500'
                  }`}
                >
                  {currentStep > step ? (
                    <Check size={20} />
                  ) : (
                    <span className="text-lg font-medium">{step}</span>
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-20 h-0.5 mx-2 transition-all ${
                      currentStep > step ? 'bg-pictus-lime' : 'bg-gray-500'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-24 mt-4">
            <span className={`text-sm ${currentStep >= 1 ? 'text-pictus-lime' : 'text-gray-500'}`}>
              Organizácia
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-pictus-lime' : 'text-gray-500'}`}>
              Používateľ
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-pictus-lime' : 'text-gray-500'}`}>
              Prehľad
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
          {/* Step 1: Organization Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Building className="w-8 h-8 text-pictus-lime" />
                <h2 className="text-3xl font-light">Detaily organizácie</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Názov organizácie (voliteľné — automaticky z mena)
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="napr. ABC Company s.r.o."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hlavný kontakt - email (voliteľné)
                </label>
                <input
                  type="text"
                  value={organizationMainContact}
                  onChange={(e) => setOrganizationMainContact(e.target.value)}
                  placeholder="napr. jozef@icloud.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                />
              </div>

              {/* Address / Invoicing fields */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-200 mb-2">Fakturačná adresa</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">IČO</label>
                    <input
                      type="text"
                      value={ico}
                      onChange={(e) => { setIco(e.target.value); setInvoicingData((prev) => ({ ...prev, ico: e.target.value })) }}
                      placeholder="12345678"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">DIČ</label>
                    <input
                      type="text"
                      value={dic}
                      onChange={(e) => { setDic(e.target.value); setInvoicingData((prev) => ({ ...prev, dic: e.target.value })) }}
                      placeholder="2012345678"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ulica *</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => { setStreet(e.target.value); setInvoicingData((prev) => ({ ...prev, street: e.target.value })) }}
                    placeholder="Hlavná 1"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Mesto *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => { setCity(e.target.value); setInvoicingData((prev) => ({ ...prev, city: e.target.value })) }}
                      placeholder="Bratislava"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">PSČ *</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => { setPostalCode(e.target.value); setInvoicingData((prev) => ({ ...prev, postalCode: e.target.value })) }}
                      placeholder="81101"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Krajina *</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => { setCountry(e.target.value); setInvoicingData((prev) => ({ ...prev, country: e.target.value })) }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tier *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tiers.map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedTierId === tier.id
                          ? 'border-pictus-lime bg-pictus-lime/10'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <h3 className="text-xl font-medium text-pictus-white mb-2">{tier.name}</h3>
                      {tier.pricePerVehicle != null && (
                        <div className="mb-2">
                          <p className="text-pictus-lime text-lg font-medium">
                            {Number(tier.pricePerVehicle) === 0
                              ? 'Zadarmo'
                              : `${tier.pricePerVehicle} € / vozidlo / mesiac`}
                          </p>
                          {Number(tier.pricePerVehicle) > 0 && tier.pricePerVehicleYearly != null && (
                            <p className="text-pictus-lime/70 text-sm">
                              {tier.pricePerVehicleYearly} € / vozidlo / rok
                            </p>
                          )}
                        </div>
                      )}
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>Používatelia: {tier.usersLimit}</p>
                        <p>Vozidlá: {tier.vehiclesLimit}</p>
                        <p>Notifikácie: {tier.notificationsLimit}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Purchased Vehicles - show for paid tiers */}
              {getSelectedTier() && getSelectedTier()?.name !== 'FREE' && (
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Počet zakúpených vozidiel *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={purchasedVehicles}
                    onChange={(e) => setPurchasedVehicles(e.target.value)}
                    placeholder="napr. 10"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                  />
                  {purchasedVehicles &&
                    getSelectedTier()?.pricePerVehicle != null &&
                    Number(getSelectedTier()?.pricePerVehicle) > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-pictus-lime text-lg">
                          {billingInterval === 'monthly'
                            ? `Mesačná cena: ${(Number(purchasedVehicles) * Number(getSelectedTier()?.pricePerVehicle)).toFixed(2)} € / mesiac`
                            : (() => {
                                const t = getSelectedTier()
                                const yearly = t?.pricePerVehicleYearly != null
                                  ? (Number(purchasedVehicles) * Number(t.pricePerVehicleYearly)).toFixed(2)
                                  : (Number(purchasedVehicles) * Number(t?.pricePerVehicle) * 12 * Number(t?.yearlyDiscount ?? 0.83)).toFixed(2)
                                return `Ročná cena: ${yearly} € / rok`
                              })()}
                        </p>
                        <p className="text-sm text-gray-400">
                          {billingInterval === 'monthly'
                            ? `(${getSelectedTier()?.pricePerVehicle} € × ${purchasedVehicles} vozidiel)`
                            : (() => {
                                const t = getSelectedTier()
                                return t?.pricePerVehicleYearly != null
                                  ? `(${t.pricePerVehicleYearly} € × ${purchasedVehicles} vozidiel)`
                                  : `(${t?.pricePerVehicle} € × 12 × ${t?.yearlyDiscount ?? 0.83} × ${purchasedVehicles} vozidiel)`
                              })()}
                        </p>
                      </div>
                    )}
                </div>
              )}

              {/* Billing Interval - show for paid tiers */}
              {getSelectedTier() && getSelectedTier()?.name !== 'FREE' && (
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Fakturačný interval
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setBillingInterval('monthly')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all text-center ${
                        billingInterval === 'monthly'
                          ? 'border-pictus-lime bg-pictus-lime/10 text-pictus-white'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      Mesačne
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingInterval('yearly')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all text-center ${
                        billingInterval === 'yearly'
                          ? 'border-pictus-lime bg-pictus-lime/10 text-pictus-white'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      Ročne
                    </button>
                  </div>

                  {/* Skip payment - only for BASIC */}
                  {getSelectedTier()?.name === 'BASIC' && (
                    <div className="mt-4 flex items-center">
                      <input
                        type="checkbox"
                        id="skipPayment"
                        checked={skipPayment}
                        onChange={(e) => setSkipPayment(e.target.checked)}
                        className="w-4 h-4 text-pictus-lime bg-white/5 border-white/10 rounded focus:ring-pictus-lime"
                      />
                      <label htmlFor="skipPayment" className="ml-2 text-sm text-gray-300">
                        Preskočiť platbu (rodinný benefit)
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Limits Override */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowCustomLimits(!showCustomLimits)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-pictus-lime transition-colors"
                >
                  {showCustomLimits ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  Vlastné limity (voliteľné)
                </button>
                {showCustomLimits && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/5 rounded-lg border border-white/10 p-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Používatelia</label>
                      <input
                        type="number"
                        value={customUsersLimit}
                        onChange={(e) => setCustomUsersLimit(e.target.value)}
                        placeholder={getSelectedTier()?.usersLimit?.toString() || '—'}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pictus-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Vozidlá</label>
                      <input
                        type="number"
                        value={customVehiclesLimit}
                        onChange={(e) => setCustomVehiclesLimit(e.target.value)}
                        placeholder={getSelectedTier()?.vehiclesLimit?.toString() || '—'}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pictus-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Notifikácie</label>
                      <input
                        type="number"
                        value={customNotificationsLimit}
                        onChange={(e) => setCustomNotificationsLimit(e.target.value)}
                        placeholder={getSelectedTier()?.notificationsLimit?.toString() || '—'}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pictus-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Šablóny</label>
                      <input
                        type="number"
                        value={customTemplatesLimit}
                        onChange={(e) => setCustomTemplatesLimit(e.target.value)}
                        placeholder={getSelectedTier()?.templatesLimit?.toString() || '—'}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pictus-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Typy notifikácií</label>
                      <input
                        type="number"
                        value={customNotificationTypesLimit}
                        onChange={(e) => setCustomNotificationTypesLimit(e.target.value)}
                        placeholder={getSelectedTier()?.notificationTypesLimit?.toString() || '—'}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-pictus-lime"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: User Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8 text-pictus-lime" />
                <h2 className="text-3xl font-light">Používateľ</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Meno *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priezvisko *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Telefónne číslo
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 font-light text-sm select-none">+421</span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s]/g, ''))}
                      placeholder="9XX XXX XXX"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pictus-lime transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heslo * ... Nech si klient teraz zapíše
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Potvrďte heslo *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFleetManager"
                    checked={isFleetManager}
                    onChange={(e) => setIsFleetManager(e.target.checked)}
                    className="w-4 h-4 text-pictus-lime bg-white/5 border-white/10 rounded focus:ring-pictus-lime"
                  />
                  <label htmlFor="isFleetManager" className="ml-2 text-sm text-gray-300">
                    Správca flotily (môže spravovať vozidlá a používateľov)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-pictus-lime" />
                <h2 className="text-3xl font-light">Prehľad a potvrdenie</h2>
              </div>

              <div className="space-y-6">
                {/* Organization Summary */}
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <h3 className="text-xl font-medium text-pictus-lime mb-4">Organizácia</h3>
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="text-gray-400">Názov:</span> {organizationName}
                    </p>
                    {organizationMainContact && (
                      <p>
                        <span className="text-gray-400">Hlavný kontakt:</span>{' '}
                        {organizationMainContact}
                      </p>
                    )}
                    {(ico || dic) && (
                      <p>
                        <span className="text-gray-400">IČO / DIČ:</span>{' '}
                        {[ico, dic].filter(Boolean).join(' / ')}
                      </p>
                    )}
                    {street && (
                      <p>
                        <span className="text-gray-400">Adresa:</span>{' '}
                        {[street, city, postalCode, country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <p>
                      <span className="text-gray-400">Tier:</span> {getSelectedTier()?.name}
                    </p>
                    {purchasedVehicles && (
                      <p>
                        <span className="text-gray-400">Zakúpené vozidlá:</span> {purchasedVehicles}
                        {getSelectedTier()?.pricePerVehicle != null &&
                          Number(getSelectedTier()?.pricePerVehicle) > 0 && (
                            <span className="ml-2 text-pictus-lime">
                              {billingInterval === 'monthly'
                                ? `(${(Number(purchasedVehicles) * Number(getSelectedTier()?.pricePerVehicle)).toFixed(2)} € / mesiac)`
                                : (() => {
                                    const t = getSelectedTier()
                                    const yearly = t?.pricePerVehicleYearly != null
                                      ? (Number(purchasedVehicles) * Number(t.pricePerVehicleYearly)).toFixed(2)
                                      : (Number(purchasedVehicles) * Number(t?.pricePerVehicle) * 12 * Number(t?.yearlyDiscount ?? 0.83)).toFixed(2)
                                    return `(${yearly} € / rok)`
                                  })()}
                            </span>
                          )}
                      </p>
                    )}
                    {getSelectedTier()?.name !== 'FREE' && (
                      <>
                        <p>
                          <span className="text-gray-400">Fakturácia:</span>{' '}
                          {billingInterval === 'monthly' ? 'Mesačne' : 'Ročne'}
                        </p>
                        <p>
                          <span className="text-gray-400">Platba:</span>{' '}
                          {getSelectedTier()?.name === 'BASIC' && skipPayment ? (
                            <span className="text-yellow-400">Preskočená (rodinný benefit)</span>
                          ) : (
                            <span className="text-pictus-lime">Stripe Checkout</span>
                          )}
                        </p>
                      </>
                    )}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400 mb-2">
                        Limity
                        {customUsersLimit ||
                        customVehiclesLimit ||
                        customNotificationsLimit ||
                        customTemplatesLimit ||
                        customNotificationTypesLimit
                          ? ' (vlastné)'
                          : ''}
                        :
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>Používatelia: {customUsersLimit || getSelectedTier()?.usersLimit}</p>
                        <p>
                          Vozidlá:{' '}
                          {customVehiclesLimit ||
                            purchasedVehicles ||
                            getSelectedTier()?.vehiclesLimit}
                        </p>
                        <p>
                          Notifikácie:{' '}
                          {customNotificationsLimit || getSelectedTier()?.notificationsLimit}
                        </p>
                        <p>Šablóny: {customTemplatesLimit || getSelectedTier()?.templatesLimit}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Summary */}
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <h3 className="text-xl font-medium text-pictus-lime mb-4">Používateľ</h3>
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="text-gray-400">Meno:</span> {firstName} {lastName}
                    </p>
                    <p>
                      <span className="text-gray-400">Email:</span> {email}
                    </p>
                    {phoneNumber && (
                      <p>
                        <span className="text-gray-400">Telefón:</span> {fullPhoneNumber}
                      </p>
                    )}
                    <p>
                      <span className="text-gray-400">Rola:</span>{' '}
                      {isFleetManager ? 'Správca flotily' : 'Používateľ'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                currentStep === 1
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ArrowLeft size={20} />
              Späť
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black rounded-lg hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all font-medium"
              >
                Ďalej
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    {(() => {
                      const t = getSelectedTier()
                      const isPaid = t?.name === 'BASIC' || t?.name === 'BUSINESS'
                      const needsPayment = isPaid && !(t?.name === 'BASIC' && skipPayment)
                      return needsPayment ? 'Presmerovanie na platbu...' : 'Vytváram...'
                    })()}
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    {(() => {
                      const t = getSelectedTier()
                      const isPaid = t?.name === 'BASIC' || t?.name === 'BUSINESS'
                      const needsPayment = isPaid && !(t?.name === 'BASIC' && skipPayment)
                      return needsPayment ? 'Pokračovať na platbu' : 'Vytvoriť klienta'
                    })()}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardClientPage
