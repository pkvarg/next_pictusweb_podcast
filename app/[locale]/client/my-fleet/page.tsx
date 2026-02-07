'use client'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import {
  User,
  UserCheck,
  LogOut,
  Car,
  ArrowLeft,
  Calendar,
  Wrench,
  FileText,
  AlertCircle,
} from 'lucide-react'

const MyFleetPage = () => {
  const { data: session } = useSession()
  const t = useTranslations('Client')

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  // Mock data structure for when vehicles table is ready
  const mockVehicles = [
    // Will be populated from database later
  ]

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
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-r from-purple-600/20 to-purple-800/20 rounded-xl">
            <Car className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white">Moja flotila</h1>
            <p className="text-2xl text-purple-300">Prehľad vašich vozidiel</p>
          </div>
        </div>

        {/* Vehicles Grid */}
        {mockVehicles.length === 0 ? (
          // Empty State - Coming Soon
          <div className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 rounded-3xl p-12 border border-purple-500/30 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="p-6 bg-purple-600/20 rounded-2xl inline-block mb-6">
                <Car className="w-16 h-16 text-purple-400" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Správa flotily prichádza čoskoro</h2>
              <p className="text-xl text-purple-300 mb-8">
                Táto sekcia bude obsahovať detailné informácie o vašich vozidlách, históriu údržby,
                dokumenty a ďalšie užitočné funkcie pre správu flotily.
              </p>

              {/* Preview Cards - What will be available */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-500/20">
                  <div className="p-3 bg-purple-600/20 rounded-lg inline-block mb-4">
                    <Car className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Detaily vozidiel</h3>
                  <p className="text-purple-300">
                    Kompletné informácie o všetkých vozidlách vo vašej flotile
                  </p>
                </div>

                <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-500/20">
                  <div className="p-3 bg-purple-600/20 rounded-lg inline-block mb-4">
                    <Calendar className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">História údržby</h3>
                  <p className="text-purple-300">
                    Prehľad všetkých servisných záznamov a nadchádzajúcich kontrol
                  </p>
                </div>

                <div className="bg-purple-900/30 rounded-xl p-6 border border-purple-500/20">
                  <div className="p-3 bg-purple-600/20 rounded-lg inline-block mb-4">
                    <FileText className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Dokumenty</h3>
                  <p className="text-purple-300">
                    Správa všetkých dôležitých dokumentov k vozidlám na jednom mieste
                  </p>
                </div>
              </div>

              {/* Info Message */}
              <div className="mt-12 bg-purple-600/20 border border-purple-500/30 rounded-xl p-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h4 className="text-lg font-bold text-white mb-2">Pracujeme na tom</h4>
                  <p className="text-purple-300">
                    Zatiaľ môžete používať dashboard pre sledovanie notifikácií a úloh. Správa
                    flotily bude dostupná v blízkej budúcnosti.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Vehicle Cards Grid (for when data is available)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVehicles.map((vehicle: any, index: number) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-600/20 rounded-lg">
                    <Car className="w-8 h-8 text-purple-400" />
                  </div>
                  <span className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">
                    Aktívne
                  </span>
                </div>
                {/* Vehicle details will go here */}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default MyFleetPage
