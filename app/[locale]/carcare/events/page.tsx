'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/routing'
import { Loader2 } from 'lucide-react'
import CarCareEventsView, { type EvOccurrence } from '@/app/components/carcare/CarCareEventsView'

export default function CarCareEventsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [occurrences, setOccurrences] = useState<EvOccurrence[] | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(() => {
    fetch('/api/carcare/occurrences')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setOccurrences(d.occurrences))
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') load()
  }, [status, load])

  if (status === 'loading' || (status === 'authenticated' && !occurrences && !error)) {
    return (
      <div className="min-h-screen bg-pictus-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pictus-lime animate-spin" />
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-screen bg-pictus-black text-gray-300 flex items-center justify-center">
        Nepodarilo sa načítať udalosti.
      </div>
    )
  }
  if (!occurrences) return null
  return <CarCareEventsView occurrences={occurrences} />
}
