'use client'

import { use, useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/routing'
import { Loader2 } from 'lucide-react'
import CarCareEventDetailView, {
  type EventDetailData,
} from '@/app/components/carcare/CarCareEventDetailView'

export default function CarCareEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<EventDetailData | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    fetch(`/api/carcare/events/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setData(d))
      .catch(() => setError(true))
  }, [id])

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
        Udalosť sa nepodarilo načítať.
      </div>
    )
  }
  if (!data) return null
  return <CarCareEventDetailView data={data} reload={load} />
}
