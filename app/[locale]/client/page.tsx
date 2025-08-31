'use client'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { User, FolderOpen, Headphones, LogOut, Mail, Settings } from 'lucide-react'
import { useEffect, useRef } from 'react'
import VehicleNotificationsDashboard from '@/app/components/client/VehicleNotificationsDashboard'

const ClientZone = () => {
  const { data: session } = useSession()
  const t = useTranslations('Client')
  const iframe1Ref = useRef<HTMLIFrameElement>(null)
  const iframe2Ref = useRef<HTMLIFrameElement>(null)
  const iframe3Ref = useRef<HTMLIFrameElement>(null)

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Headphones size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Pictusweb</h1>
                  <p className="text-xs text-purple-300 hidden sm:block">Client Area</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <User size={16} />
                <span className="text-sm">{session?.user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-300 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
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
        {/* Welcome Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl lg:text-6xl font-light text-white mb-6 leading-tight">
              {t('welcomeTitle')}
            </h1>
            <p className="text-2xl text-gray-300 mb-8 leading-relaxed font-light max-w-3xl mx-auto">
              {t('welcomeSubtitle')}
            </p>
          </div>
        </section>

        {(session?.user?.organization === 'all' ||
          'cba'.startsWith(session?.user?.organization || '')) && (
          <section id="cba" className="mb-16">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-8 backdrop-blur-sm border border-purple-500/30">
              <iframe
                src="https://metabase-u840kgwk0scgkwk8gks0sgs4.pictusweb.com/public/dashboard/56b38c4b-0a20-4810-b4b9-3194b7552fc3"
                className="w-full h-svh rounded-2xl border border-purple-500/30 bg-white/10 backdrop-blur-sm overflow-hidden"
              ></iframe>
            </div>
          </section>
        )}

        {(session?.user?.organization === 'all' ||
          'demo'.startsWith(session?.user?.organization || '')) && (
          <section id="demo" className="mb-16">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-8 backdrop-blur-sm border border-purple-500/30">
              <VehicleNotificationsDashboard company="DEMO" />
            </div>
          </section>
        )}

        {(session?.user?.organization === 'all' ||
          'demo-pv'.startsWith(session?.user?.organization || '')) && (
          <section id="demo-pv" className="mb-16">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-8 backdrop-blur-sm border border-purple-500/30">
              <VehicleNotificationsDashboard company="DEMO-PV" />
            </div>
          </section>
        )}

        {(session?.user?.organization === 'all' ||
          'firma1'.startsWith(session?.user?.organization || '')) && (
          <section id="firma1" className="mb-16">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl p-8 backdrop-blur-sm border border-purple-500/30">
              <VehicleNotificationsDashboard company="FIRMA1" />
            </div>
          </section>
        )}

        {/* User Info Section */}
        <section className="py-20">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-light text-white mb-6">Account Information</h2>
              <p className="text-xl text-gray-300 font-light">Your client dashboard details</p>
            </div>
            <div className="">
              <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-2xl p-8 backdrop-blur-sm border border-purple-500/30">
                <div className="flex items-center gap-4 mb-4">
                  <User className="w-8 h-8 text-purple-400" />
                  <h3 className="text-2xl font-semibold text-white">User Profile</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-purple-300 text-sm font-medium">Name</label>
                    <p className="text-white text-lg">{session?.user?.name}</p>
                  </div>
                  <div>
                    <label className="text-purple-300 text-sm font-medium">Email</label>
                    <p className="text-white text-lg">{session?.user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default ClientZone
