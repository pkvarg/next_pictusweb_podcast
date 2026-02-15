'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/routing'
import { useEffect } from 'react'
import { RotateCcw, Loader } from 'lucide-react'
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
      <div className="min-h-screen bg-pictus-darkest flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-pictus-darkest py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-500/20 to-blue-500/20 rounded-xl">
              <RotateCcw className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h1 className="text-5xl font-light text-pictus-white">Obnova úloh</h1>
              <p className="text-xl text-gray-400 mt-2">
                Rýchle obnovenie pravidelných povinností
              </p>
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
