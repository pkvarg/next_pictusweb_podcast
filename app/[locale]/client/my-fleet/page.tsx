'use client'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import {
  User,
  UserCheck,
  LogOut,
  Car,
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  ShieldAlert,
  Gauge,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import ExpensesModal from '@/app/components/client/ExpensesModal'
import MileageModal from '@/app/components/client/MileageModal'
import { FaEuroSign } from 'react-icons/fa'

interface MyVehicle {
  id: string
  organization: string
  type: string
  registration: string
  year: number | null
  image: string | null
  note: string | null
  createdAt: string
  updatedAt: string
}

const MyFleetPage = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const t = useTranslations('Client')
  const [vehicles, setVehicles] = useState<MyVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expensesModalOpen, setExpensesModalOpen] = useState(false)
  const [mileageModalOpen, setMileageModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<MyVehicle | null>(null)

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  useEffect(() => {
    // Check if user is authenticated and is fleet manager
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/login')
      return
    }

    if (!session.user.isFleetManager) {
      // Not a fleet manager, redirect back to client page
      router.push('/client')
      return
    }

    // Fetch vehicles
    fetchVehicles()
  }, [session, status, router])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/my-vehicles')

      if (response.status === 403) {
        setError('Prístup zamietnutý - vyžaduje sa oprávnenie správcu flotily')
        return
      }

      if (!response.ok) {
        // Just show empty state instead of error
        setVehicles([])
        return
      }

      const data = await response.json()
      setVehicles(data)
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      // Show empty state instead of error message
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Naozaj chcete odstrániť toto vozidlo?')) {
      return
    }

    try {
      const response = await fetch(`/api/my-vehicles/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete vehicle')
      }

      // Refresh the list
      fetchVehicles()
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      alert('Nepodarilo sa odstrániť vozidlo')
    }
  }

  // Show loading while checking authentication
  if (status === 'loading' || (session && loading)) {
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/client"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors text-lg"
          >
            <ArrowLeft size={20} />
            Späť na dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-purple-600/20 to-purple-800/20 rounded-xl">
              <Car className="w-10 h-10 text-purple-400" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white">Moja flotila</h1>
              <p className="text-2xl text-purple-300">{vehicles.length} vozidiel</p>
            </div>
          </div>

          <Link
            href="/client/my-fleet/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-all text-lg"
          >
            <Plus size={20} />
            Pridať vozidlo
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Vehicles Grid */}
        {vehicles.length === 0 ? (
          // Empty State
          <div className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 rounded-3xl p-12 border border-purple-500/30 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="p-6 bg-purple-600/20 rounded-2xl inline-block mb-6">
                <Car className="w-16 h-16 text-purple-400" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Žiadne vozidlá</h2>
              <p className="text-xl text-purple-300 mb-8">
                Začnite pridaním prvého vozidla do vašej flotily.
              </p>
              <Link
                href="/client/my-fleet/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-900 transition-all text-xl"
              >
                <Plus size={24} />
                Pridať prvé vozidlo
              </Link>
            </div>
          </div>
        ) : (
          // Vehicle Cards Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-400/50 transition-all"
              >
                {vehicle.image && (
                  <div className="w-full h-48 bg-purple-900/50 overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={vehicle.registration}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-3xl font-bold text-white mb-2">{vehicle.registration}</h3>
                    <p className="text-xl text-purple-300">{vehicle.type}</p>
                    {vehicle.year && (
                      <p className="text-lg text-purple-400 mt-1">Rok: {vehicle.year}</p>
                    )}
                  </div>

                  {vehicle.note && (
                    <p className="text-white/80 text-sm mb-4 line-clamp-2">{vehicle.note}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setExpensesModalOpen(true)
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-600/30 text-white px-3 py-2 rounded-lg hover:bg-purple-600/50 transition text-sm"
                      >
                        <FaEuroSign size={16} />
                        Výdavky
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setMileageModalOpen(true)
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-600/30 text-white px-3 py-2 rounded-lg hover:bg-purple-600/50 transition text-sm"
                      >
                        <Gauge size={16} />
                        Kilometre
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-purple-500/20">
                    <Link
                      href={`/client/my-fleet/${vehicle.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-purple-600/30 text-white px-4 py-2 rounded-lg hover:bg-purple-600/50 transition text-sm"
                    >
                      <Edit size={16} />
                      Upraviť
                    </Link>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600/30 text-white px-4 py-2 rounded-lg hover:bg-red-600/50 transition text-sm"
                    >
                      <Trash2 size={16} />
                      Odstrániť
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedVehicle && (
        <>
          <ExpensesModal
            isOpen={expensesModalOpen}
            onClose={() => {
              setExpensesModalOpen(false)
              setSelectedVehicle(null)
            }}
            vehicleId={selectedVehicle.id}
            vehicleRegistration={selectedVehicle.registration}
          />
          <MileageModal
            isOpen={mileageModalOpen}
            onClose={() => {
              setMileageModalOpen(false)
              setSelectedVehicle(null)
            }}
            vehicleId={selectedVehicle.id}
            vehicleRegistration={selectedVehicle.registration}
          />
        </>
      )}
    </div>
  )
}

export default MyFleetPage
