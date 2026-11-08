'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/routing'
import { Loader2 } from 'lucide-react'
import CarCareAddVehicleView from '@/app/components/carcare/CarCareAddVehicleView'

export default function CarCareAddVehiclePage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login')
  }, [status, router])

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-pictus-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pictus-lime animate-spin" />
      </div>
    )
  }
  return <CarCareAddVehicleView />
}
