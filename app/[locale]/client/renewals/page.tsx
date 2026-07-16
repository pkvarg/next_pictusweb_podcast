'use client'
import { useSession, signOut } from 'next-auth/react'
import { Link, useRouter } from '@/i18n/routing'
import { useEffect } from 'react'
import { RotateCcw, Loader, ShieldAlert, LogOut } from 'lucide-react'
import RenewalsContent from '@/app/components/client/RenewalsContent'

const RenewalsPage = () => {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [sessionStatus, router])

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-pictus-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-pictus-lime animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Načítavam obnovy...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isOrgDeleted = (session?.user as any)?.organizationDeleted === true
  if (isOrgDeleted) {
    return (
      <div className="min-h-screen bg-pictus-black flex items-center justify-center">
        <div className="text-center max-w-lg px-6">
          <ShieldAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-3xl font-light mb-4 text-red-400">Prístup zamietnutý</h1>
          <p className="text-lg text-gray-300 mb-6">Vaša organizácia bola deaktivovaná.</p>
          <p className="text-sm text-gray-500 mb-8">
            Ak si myslíte, že ide o chybu, napíšte na{' '}
            <a href="mailto:info@pictusweb.sk" className="text-pictus-lime hover:underline">
              info@pictusweb.sk
            </a>
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/client/upgrade"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pictus-lime text-pictus-black font-semibold rounded-full hover:bg-pictus-lime600 transition-all"
            >
              Upgradovať teraz
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white rounded-full hover:bg-white/10 transition-all"
            >
              <LogOut size={18} />
              Odhlásiť sa
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pictus-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/5 ring-1 ring-white/[0.06] rounded-2xl">
              <RotateCcw className="w-10 h-10 text-pictus-lime" />
            </div>
            <div>
              <h1 className="text-5xl font-light text-pictus-white">Obnova úloh</h1>
              <p className="text-xl text-gray-400 mt-2">Rýchle obnovenie pravidelných povinností</p>
            </div>
          </div>
        </div>

        {/* Renewals Content */}
        <RenewalsContent />
      </div>
    </div>
  )
}

export default RenewalsPage
