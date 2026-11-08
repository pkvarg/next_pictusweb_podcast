'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/routing'
import { Loader2 } from 'lucide-react'
import CarCareGarageView, { type GarageData } from '@/app/components/carcare/CarCareGarageView'

export default function CarCareGaragePage() {
  const { status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<GarageData | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    fetch('/api/carcare/garage')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setData(d))
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') load()
  }, [status, load])

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
        Garáž sa nepodarilo načítať.
      </div>
    )
  }
  if (!data) return null
  return <CarCareGarageView data={data} reload={load} />
}
