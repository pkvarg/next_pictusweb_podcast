'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import CarCareNotificationDefaultsView, {
  type DefaultsData,
} from '@/app/components/carcare/CarCareNotificationDefaultsView'

export default function CarCareNotificationDefaultsPage() {
  const { status } = useSession()
  const router = useRouter()
  const t = useTranslations('CarCare')
  const [data, setData] = useState<DefaultsData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/carcare/notifications/defaults')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setData(d))
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
        {t('defaults.loadFailed')}
      </div>
    )
  }
  if (!data) return null
  return <CarCareNotificationDefaultsView data={data} />
}
