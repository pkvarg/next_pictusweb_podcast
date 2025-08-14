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

  // Function to resize iframe based on content
  const resizeIframe = (iframe: HTMLIFrameElement) => {
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document
      if (iframeDocument) {
        const height = Math.max(
          iframeDocument.documentElement.scrollHeight,
          iframeDocument.body.scrollHeight,
          400 // Minimum height
        )
        iframe.style.height = height + 'px'
      }
    } catch (error) {
      // Cross-origin restrictions - fallback to reasonable heights
      console.log('Cross-origin iframe, using fallback heights')
      if (iframe === iframe1Ref.current || iframe === iframe2Ref.current) {
        iframe.style.height = '400px'
      } else {
        iframe.style.height = '600px'
      }
    }
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for messages from iframes about their content height
      if (event.data && event.data.height && event.data.iframe) {
        const targetIframe = document.querySelector(`iframe[data-iframe="${event.data.iframe}"]`) as HTMLIFrameElement
        if (targetIframe) {
          targetIframe.style.height = event.data.height + 'px'
        }
      }
    }

    window.addEventListener('message', handleMessage)

    // Set up iframe load handlers with delay for content loading
    const iframes = [iframe1Ref.current, iframe2Ref.current, iframe3Ref.current]
    
    iframes.forEach((iframe, index) => {
      if (iframe) {
        iframe.onload = () => {
          // Delay to ensure content is fully loaded
          setTimeout(() => resizeIframe(iframe), 1000)
          setTimeout(() => resizeIframe(iframe), 3000) // Second attempt for slow loading content
        }
      }
    })

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Headphones size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Pictusweb</h1>
                  <p className="text-xs text-gray-400 hidden sm:block">Client Area</p>
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
                className="flex items-center text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
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
          <p className="text-xl text-gray-300">{t('welcomeSubtitle')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 justify-between items-stretch w-full mb-8">
          <iframe
            ref={iframe1Ref}
            className="w-full lg:w-[48%] rounded-lg border border-purple-500/30 bg-gradient-to-br from-slate-800/80 to-purple-900/40"
            src="https://metabase-u840kgwk0scgkwk8gks0sgs4.pictusweb.com/public/dashboard/840710e9-c0da-4acd-b6d3-fd06fd47dd4b"
            style={{ minHeight: '400px', overflow: 'hidden' }}
            data-iframe="dashboard1"
          ></iframe>
          <iframe
            ref={iframe2Ref}
            className="w-full lg:w-[48%] rounded-lg border border-purple-500/30 bg-gradient-to-br from-slate-800/80 to-purple-900/40"
            src="https://metabase-u840kgwk0scgkwk8gks0sgs4.pictusweb.com/public/dashboard/31ce6923-6a0d-49e7-83cb-e263f9b1550c"
            style={{ minHeight: '400px', overflow: 'hidden' }}
            data-iframe="dashboard2"
          ></iframe>
        </div>

        <iframe
          ref={iframe3Ref}
          className="w-full my-8 rounded-lg border border-purple-500/30 bg-gradient-to-br from-slate-800/80 to-purple-900/40"
          src="https://metabase-u840kgwk0scgkwk8gks0sgs4.pictusweb.com/public/dashboard/b39a3903-cf10-4ee5-b5ff-0c221516ba31"
          style={{ minHeight: '600px', overflow: 'hidden' }}
          data-iframe="dashboard3"
        ></iframe>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Projects Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <FolderOpen className="w-6 h-6 text-blue-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">{t('projectsTitle')}</h2>
            </div>
            <p className="text-gray-400 mb-4">{t('noProjectsMessage')}</p>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-300 text-sm">Coming soon...</p>
              </div>
            </div>
          </div>

          {/* Services Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-purple-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">{t('servicesTitle')}</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <h3 className="text-white font-medium">Websites</h3>
                <p className="text-gray-400 text-sm">Modern web development</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <h3 className="text-white font-medium">AI Services</h3>
                <p className="text-gray-400 text-sm">Automation solutions</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <h3 className="text-white font-medium">Podcasts</h3>
                <p className="text-gray-400 text-sm">Audio content creation</p>
              </div>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-green-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">{t('supportTitle')}</h2>
            </div>
            <p className="text-gray-400 mb-4">Need help with your projects?</p>
            <a
              href="mailto:info@pictusweb.sk"
              className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t('contactSupport')}
            </a>
          </div>
        </div>

        {/* User Info Section */}
        <div className="mt-12 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm">Name</label>
              <p className="text-white">{session?.user?.name}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <p className="text-white">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ClientZone
