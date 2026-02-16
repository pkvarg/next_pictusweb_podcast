'use client'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import { User, UserCheck, LogOut, Car, ArrowLeft, Save, ShieldAlert, Upload, X } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

const NewVehiclePage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('Client')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [organizationName, setOrganizationName] = useState<string>('')
  const [formData, setFormData] = useState({
    type: '',
    registration: '',
    year: '',
    image: '',
    note: '',
  })

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/login')
      return
    }

    if (!session.user.isFleetManager) {
      router.push('/client')
      return
    }

    // Fetch organization name
    const fetchOrganization = async () => {
      if (session.user.organizationId) {
        try {
          const response = await fetch(`/api/organizations?id=${session.user.organizationId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.organizations && data.organizations.length > 0) {
              setOrganizationName(data.organizations[0].name || '')
            }
          }
        } catch (error) {
          console.error('Error fetching organization:', error)
        }
      }
    }

    fetchOrganization()
  }, [session, status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Prosím, nahrajte obrázok')
      return
    }

    setFile(selectedFile)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setFilePreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async () => {
    if (!file || !session?.user?.organization) return null

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('organization', session.user.organization)

      const response = await fetch(`${process.env.NEXT_PUBLIC_HONO_API_URL}/api/upload/fleetsync`, {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error('Nepodarilo sa nahrať obrázok')
      }

      const data = await response.json()
      return data.imageUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('Nepodarilo sa nahrať obrázok')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formData.type || !formData.registration) {
      setError('Typ a registrácia sú povinné')
      setLoading(false)
      return
    }

    try {
      // Upload image if file is selected
      let imageUrl = formData.image
      if (file) {
        const uploadedUrl = await uploadImage()
        if (!uploadedUrl) {
          setLoading(false)
          return // Error already set by uploadImage
        }
        imageUrl = uploadedUrl
      }

      const response = await fetch('/api/my-vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          registration: formData.registration,
          year: formData.year ? parseInt(formData.year) : null,
          image: imageUrl || null,
          note: formData.note || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create vehicle')
      }

      // Success - redirect to fleet page
      router.push('/client/my-fleet')
    } catch (err: any) {
      console.error('Error creating vehicle:', err)
      setError(err.message || 'Nepodarilo sa vytvoriť vozidlo')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-black text-pictus-white flex items-center justify-center font-brutal-milk">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pictus-lime"></div>
      </div>
    )
  }

  // Show access denied if organization is deleted
  const isOrgDeleted = (session?.user as any)?.organizationDeleted === true
  if (session && isOrgDeleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-black text-pictus-white flex items-center justify-center font-brutal-milk">
        <div className="text-center max-w-lg px-6">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-light mb-4 text-red-400">Prístup zamietnutý</h1>
          <p className="text-lg text-gray-300 mb-6">
            Vaša organizácia bola deaktivovaná. Kontaktujte administrátora alebo vášho marketéra.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Ak si myslíte, že ide o chybu, napíšte na{' '}
            <a href="mailto:info@pictusweb.sk" className="text-pictus-lime hover:underline">
              info@pictusweb.sk
            </a>
          </p>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
          >
            <LogOut size={18} />
            Odhlásiť sa
          </button>
        </div>
      </div>
    )
  }

  // Show access denied if not fleet manager
  if (session && !session.user.isFleetManager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-black text-pictus-white flex items-center justify-center font-brutal-milk">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-3xl font-light mb-4">Prístup zamietnutý</h2>
          <p className="text-pictus-lime mb-6">
            Na prístup k správe flotily potrebujete oprávnenie správcu flotily.
          </p>
          <Link
            href="/client"
            className="inline-flex items-center gap-2 bg-pictus-lime600 text-pictus-black px-6 py-3 rounded-lg hover:bg-pictus-lime700 transition"
          >
            <ArrowLeft size={20} />
            Späť na dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-black text-pictus-white font-brutal-milk">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-pictus-lime/30 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 text-pictus-white">
                <div className="w-8 h-8 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-lg flex items-center justify-center">
                  <UserCheck size={18} className="text-pictus-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-light">Pictusweb</h1>
                  <p className="text-lg text-pictus-lime hidden sm:block">FleetSync</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-pictus-white">
                <User size={16} />
                <span className="text-lg">{session?.user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-lg text-pictus-white hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('logOut')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/client/my-fleet"
            className="inline-flex items-center gap-2 text-pictus-lime hover:text-pictus-lime600 transition-colors text-lg"
          >
            <ArrowLeft size={20} />
            Späť na flotilu
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-xl">
            <Car className="w-10 h-10 text-pictus-black" />
          </div>
          <div>
            <h1 className="text-5xl font-light text-pictus-white">Pridať vozidlo</h1>
            <p className="text-2xl text-pictus-lime">Nové vozidlo do flotily</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-3xl p-8 border border-pictus-lime/30"
        >
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Type */}
            <div>
              <label className="block text-pictus-white text-lg font-light mb-2">
                Typ vozidla *
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                placeholder="napr. Mercedes..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-pictus-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent transition-all"
              />
            </div>

            {/* Registration */}
            <div>
              <label className="block text-pictus-white text-lg font-light mb-2">
                Registračná značka *
              </label>
              <input
                type="text"
                name="registration"
                value={formData.registration}
                onChange={handleChange}
                required
                placeholder="napr. BA-123-XY"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-pictus-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent transition-all"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-pictus-white text-lg font-light mb-2">Rok výroby</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear() + 1}
                placeholder="napr. 2020"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-pictus-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent transition-all"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-pictus-white text-lg font-light mb-2">
                Obrázok vozidla
              </label>

              {!filePreview ? (
                <div className="border-2 border-dashed border-pictus-lime/30 rounded-lg p-6 text-center hover:border-pictus-lime/50 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="vehicle-image"
                  />
                  <label
                    htmlFor="vehicle-image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-12 h-12 text-pictus-lime" />
                    <p className="text-pictus-white">Kliknite pre výber obrázku</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative h-48 w-full border border-pictus-lime/30 rounded-lg overflow-hidden">
                    <Image
                      src={filePreview}
                      alt="Náhľad"
                      fill
                      style={{ objectFit: 'contain' }}
                      className="bg-black/20"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-pictus-white text-lg font-light mb-2">Poznámka</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={4}
                placeholder="Doplňujúce informácie o vozidle..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-pictus-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Organization Info */}
            <div className="bg-pictus-lime/20 border border-pictus-lime/30 rounded-xl p-4">
              <p className="text-pictus-lime text-sm">
                <strong>Organizácia:</strong> {organizationName || 'Načítavam...'}
              </p>
              <p className="text-pictus-lime text-xs mt-1">
                Vozidlo bude automaticky priradené k vašej organizácii
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-4 mt-8">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black px-6 py-4 rounded-lg font-light hover:from-pictus-lime600 hover:to-pictus-lime700 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-pictus-black/30 border-t-pictus-black rounded-full animate-spin" />
                  {uploading ? 'Nahrávam obrázok...' : 'Ukladám...'}
                </>
              ) : (
                <>
                  <Save size={20} />
                  Uložiť vozidlo
                </>
              )}
            </button>
            <Link
              href="/client/my-fleet"
              className="px-6 py-4 bg-white/10 text-pictus-white rounded-lg font-light hover:bg-white/20 transition-all text-lg"
            >
              Zrušiť
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}

export default NewVehiclePage
