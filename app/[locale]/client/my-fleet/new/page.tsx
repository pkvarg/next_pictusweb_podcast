'use client'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import { User, UserCheck, LogOut, Car, ArrowLeft, Save, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'

const NewVehiclePage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('Client')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
  }, [session, status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
      const response = await fetch('/api/my-vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          registration: formData.registration,
          year: formData.year ? parseInt(formData.year) : null,
          image: formData.image || null,
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  // Show access denied if not fleet manager
  if (session && !session.user.isFleetManager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Prístup zamietnutý</h2>
          <p className="text-purple-300 mb-6">
            Na prístup k správe flotily potrebujete oprávnenie správcu flotily.
          </p>
          <Link
            href="/client"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            <ArrowLeft size={20} />
            Späť na dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                  <UserCheck size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Pictusweb</h1>
                  <p className="text-lg text-purple-300 hidden sm:block">FleetSync</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User size={16} />
                <span className="text-lg">{session?.user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-lg text-white hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
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
            className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors text-lg"
          >
            <ArrowLeft size={20} />
            Späť na flotilu
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-r from-purple-600/20 to-purple-800/20 rounded-xl">
            <Car className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white">Pridať vozidlo</h1>
            <p className="text-2xl text-purple-300">Nové vozidlo do flotily</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 rounded-3xl p-8 border border-purple-500/30"
        >
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Type */}
            <div>
              <label className="block text-white text-lg font-medium mb-2">Typ vozidla *</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                placeholder="napr. Mercedes..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Registration */}
            <div>
              <label className="block text-white text-lg font-medium mb-2">
                Registračná značka *
              </label>
              <input
                type="text"
                name="registration"
                value={formData.registration}
                onChange={handleChange}
                required
                placeholder="napr. BA-123-XY"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-white text-lg font-medium mb-2">Rok výroby</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear() + 1}
                placeholder="napr. 2020"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-white text-lg font-medium mb-2">URL obrázku</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/vehicle.jpg"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <p className="text-purple-400 text-sm mt-2">Vložte URL obrázku vozidla (voliteľné)</p>
            </div>

            {/* Note */}
            <div>
              <label className="block text-white text-lg font-medium mb-2">Poznámka</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={4}
                placeholder="Doplňujúce informácie o vozidle..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Organization Info */}
            <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4">
              <p className="text-purple-300 text-sm">
                <strong>Organizácia:</strong> {session?.user?.organization}
              </p>
              <p className="text-purple-400 text-xs mt-1">
                Vozidlo bude automaticky priradené k vašej organizácii
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ukladám...
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
              className="px-6 py-4 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all text-lg"
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
