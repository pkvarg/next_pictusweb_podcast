'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/routing'
import { Loader2 } from 'lucide-react'
import CarCareDashboardView, {
  type DashboardData,
} from '@/app/components/carcare/CarCareDashboardView'

export default function CarCarePage() {
  const { status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/carcare/dashboard')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setData)
      .catch(() => setError(true))
  }, [status])

  if (status === 'loading' || (status === 'authenticated' && !data && !error)) {
    return (
      <div className="min-h-screen bg-pictus-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pictus-lime animate-spin" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-pictus-black text-gray-300 flex items-center justify-center">
        Nepodarilo sa načítať dashboard.
      </div>
    )
  }
  if (!data) return null
  return <CarCareDashboardView data={data} />
}
