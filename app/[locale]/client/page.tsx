'use client'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { User, FolderOpen, Headphones, LogOut, Mail, Settings } from 'lucide-react'
import { useEffect, useRef } from 'react'

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
    <div className="min-h-screen bg-blue-300">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-400 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-700 to-blue-600 rounded-lg flex items-center justify-center">
                  <Headphones size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Pictusweb</h1>
                  <p className="text-xs text-blue-700 hidden sm:block">Client Area</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User size={16} />
                <span className="text-sm">{session?.user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
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
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t('welcomeTitle')}</h1>
          <p className="text-xl text-gray-600">{t('welcomeSubtitle')}</p>
        </div>

        <div className="mb-8">
          <iframe
            src="https://metabase-u840kgwk0scgkwk8gks0sgs4.pictusweb.com/public/dashboard/56b38c4b-0a20-4810-b4b9-3194b7552fc3"
            className="w-full h-svh rounded-lg border border-blue-400 bg-white shadow-sm overflow-hidden"
          ></iframe>
        </div>

        {/* Dashboard Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         
          <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center mb-4">
              <FolderOpen className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t('projectsTitle')}</h2>
            </div>
            <p className="text-gray-600 mb-4">{t('noProjectsMessage')}</p>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-gray-600 text-sm">Coming soon...</p>
              </div>
            </div>
          </div>
     
          <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t('servicesTitle')}</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <h3 className="text-gray-900 font-medium">Websites</h3>
                <p className="text-gray-600 text-sm">Modern web development</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <h3 className="text-gray-900 font-medium">AI Services</h3>
                <p className="text-gray-600 text-sm">Automation solutions</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <h3 className="text-gray-900 font-medium">Podcasts</h3>
                <p className="text-gray-600 text-sm">Audio content creation</p>
              </div>
            </div>
          </div>
         
          <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t('supportTitle')}</h2>
            </div>
            <p className="text-gray-600 mb-4">Need help with your projects?</p>
            <a
              href="mailto:info@pictusweb.sk"
              className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t('contactSupport')}
            </a>
          </div>
        </div> */}

        {/* User Info Section */}
        <div className="mt-12 bg-white rounded-lg p-6 border border-blue-400 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-blue-700 text-sm font-medium">Name</label>
              <p className="text-gray-900">{session?.user?.name}</p>
            </div>
            <div>
              <label className="text-blue-700 text-sm font-medium">Email</label>
              <p className="text-gray-900">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ClientZone
