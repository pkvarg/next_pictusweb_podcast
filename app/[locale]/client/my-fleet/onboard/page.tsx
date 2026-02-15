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
  Users,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

interface Tier {
  id: string
  name: string
  usersLimit: number
  vehiclesLimit: number
  notificationsLimit: number
  templatesLimit: number
  notificationTypesLimit: number
}

interface PictusaciUser {
  id: string
  firstName: string
  lastName: string
  email: string
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

  // PICTUSACI users (for existing user selection)
  const [pictusaciUsers, setPictusaciUsers] = useState<PictusaciUser[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Step 1: Organization data
  const [organizationName, setOrganizationName] = useState('')
  const [organizationMainContact, setOrganizationMainContact] = useState('')
  const [selectedTierId, setSelectedTierId] = useState('')

  // Step 2: User data
  const [userType, setUserType] = useState<'new' | 'existing'>('new')
  const [existingUserId, setExistingUserId] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isFleetManager, setIsFleetManager] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  // Fetch PICTUSACI users when user type is 'existing'
  useEffect(() => {
    if (userType === 'existing' && pictusaciUsers.length === 0) {
      const fetchPictusaciUsers = async () => {
        try {
          setUsersLoading(true)
          const orgId = (session?.user as any)?.organizationId || session?.user?.organization
          if (!orgId) return

          const response = await fetch(`/api/users?organizationId=${orgId}`)
          if (response.ok) {
            const data = await response.json()
            setPictusaciUsers(data || [])
          }
        } catch (err) {
          console.error('Error fetching users:', err)
        } finally {
          setUsersLoading(false)
        }
      }

      fetchPictusaciUsers()
    }
  }, [userType, session, pictusaciUsers.length])

  const validateStep1 = () => {
    if (!organizationName.trim()) {
      setError('Názov organizácie je povinný')
      return false
    }
    if (!selectedTierId) {
      setError('Vyberte tier')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (userType === 'new') {
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
    } else {
      if (!existingUserId) {
        setError('Vyberte používateľa')
        return false
      }
    }
    return true
  }

  const handleNextStep = () => {
    setError('')

    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
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

    try {
      const payload = {
        organizationName,
        organizationMainContact,
        tierId: selectedTierId,
        userType,
        ...(userType === 'new'
          ? {
              firstName,
              lastName,
              email,
              password,
              phoneNumber,
              isFleetManager,
            }
          : {
              existingUserId,
            }),
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
  const getSelectedUser = () => pictusaciUsers.find((u) => u.id === existingUserId)

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
                  Názov organizácie *
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
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>Používatelia: {tier.usersLimit}</p>
                        <p>Vozidlá: {tier.vehiclesLimit}</p>
                        <p>Notifikácie: {tier.notificationsLimit}</p>
                      </div>
                    </button>
                  ))}
                </div>
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

              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Typ používateľa *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setUserType('new')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      userType === 'new'
                        ? 'border-pictus-lime bg-pictus-lime/10'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <User className="w-6 h-6 text-pictus-lime mb-2" />
                    <h3 className="text-lg font-medium text-pictus-white">Nový používateľ</h3>
                    <p className="text-sm text-gray-400">Vytvorte nového používateľa</p>
                  </button>
                  <button
                    onClick={() => setUserType('existing')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      userType === 'existing'
                        ? 'border-pictus-lime bg-pictus-lime/10'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <Users className="w-6 h-6 text-pictus-lime mb-2" />
                    <h3 className="text-lg font-medium text-pictus-white">Existujúci používateľ</h3>
                    <p className="text-sm text-gray-400">
                      Priraďte existujúceho PICTUSACI používateľa
                    </p>
                  </button>
                </div>
              </div>

              {/* New User Form */}
              {userType === 'new' && (
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
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Heslo *</label>
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
              )}

              {/* Existing User Selection */}
              {userType === 'existing' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vyberte používateľa *
                  </label>
                  {usersLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pictus-lime mx-auto"></div>
                      <p className="text-gray-400 mt-2">Načítavam používateľov...</p>
                    </div>
                  ) : pictusaciUsers.length === 0 ? (
                    <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">Žiadni dostupní používatelia</p>
                    </div>
                  ) : (
                    <select
                      value={existingUserId}
                      onChange={(e) => setExistingUserId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime transition-all"
                    >
                      <option value="">-- Vyberte používateľa --</option>
                      {pictusaciUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
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
                    <p>
                      <span className="text-gray-400">Tier:</span> {getSelectedTier()?.name}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400 mb-2">Limity:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>Používatelia: {getSelectedTier()?.usersLimit}</p>
                        <p>Vozidlá: {getSelectedTier()?.vehiclesLimit}</p>
                        <p>Notifikácie: {getSelectedTier()?.notificationsLimit}</p>
                        <p>Šablóny: {getSelectedTier()?.templatesLimit}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Summary */}
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <h3 className="text-xl font-medium text-pictus-lime mb-4">Používateľ</h3>
                  <div className="space-y-2 text-gray-300">
                    {userType === 'new' ? (
                      <>
                        <p>
                          <span className="text-gray-400">Typ:</span> Nový používateľ
                        </p>
                        <p>
                          <span className="text-gray-400">Meno:</span> {firstName} {lastName}
                        </p>
                        <p>
                          <span className="text-gray-400">Email:</span> {email}
                        </p>
                        {phoneNumber && (
                          <p>
                            <span className="text-gray-400">Telefón:</span> {phoneNumber}
                          </p>
                        )}
                        <p>
                          <span className="text-gray-400">Rola:</span>{' '}
                          {isFleetManager ? 'Správca flotily' : 'Používateľ'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          <span className="text-gray-400">Typ:</span> Existujúci používateľ
                        </p>
                        <p>
                          <span className="text-gray-400">Meno:</span>{' '}
                          {getSelectedUser()?.firstName} {getSelectedUser()?.lastName}
                        </p>
                        <p>
                          <span className="text-gray-400">Email:</span> {getSelectedUser()?.email}
                        </p>
                      </>
                    )}
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
                    Vytváram...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Vytvoriť klienta
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
