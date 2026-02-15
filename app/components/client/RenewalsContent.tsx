'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { RotateCcw, Calendar, AlertCircle, Check, Loader } from 'lucide-react'
import RenewalCard from './RenewalCard'

interface VehicleNotification {
  id: number
  dutyBatchId: string | null
  isPdr: boolean
  pdrReminderFor: string | null
  renewedFromBatchId: string | null
  organizationId: string | null
  vehicleRegistration: string | null
  notificationType: string | null
  notificationChannel: string | null
  notificationDate: string | null
  dutyDate: string | null
  emailMessage: string | null
  status: string
  personName: string | null
  email: string | null
  phoneNumber: string | null
  userId: string | null
  myVehicleId: string | null
  myVehicle?: {
    registration: string
    type: string
  }
}

interface DutyBatch {
  dutyBatchId: string
  vehicleRegistration: string
  notificationType: string
  originalDutyDate: string
  allNotifications: VehicleNotification[]
  intervalsUsed: number[]
  isPdrType: boolean
  pdrReminder: VehicleNotification
  status: 'pending' | 'completed'
}

type StatusFilter = 'pending' | 'completed' | 'all'

interface RenewalsContentProps {
  embedded?: boolean
}

const RenewalsContent = ({ embedded = false }: RenewalsContentProps) => {
  const { data: session } = useSession()

  const [dutyBatches, setDutyBatches] = useState<DutyBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  // Fetch user organization
  useEffect(() => {
    if (session?.user) {
      const orgId = (session.user as any)?.organizationId || session.user?.organization
      setOrganizationId(orgId)
    }
  }, [session])

  // Fetch renewals when organization or filter changes
  useEffect(() => {
    if (organizationId) {
      fetchRenewals()
    }
  }, [organizationId, statusFilter])

  const fetchRenewals = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/api/duty-renewals?organizationId=${organizationId}&status=${statusFilter}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch renewals')
      }

      const data = await response.json()
      setDutyBatches(data.dutyBatches || [])
    } catch (error) {
      console.error('Error fetching renewals:', error)
      setError('Nepodarilo sa načítať obnovy úloh')
    } finally {
      setLoading(false)
    }
  }

  const handleRenewalSuccess = () => {
    fetchRenewals()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-pictus-lime animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Načítavam obnovy...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={embedded ? '' : 'max-w-6xl mx-auto'}>
      {/* Status Filter */}
      <div className="mb-8 border-b border-white/10">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`flex items-center gap-2 px-4 py-3 text-lg font-light transition-all ${
              statusFilter === 'pending'
                ? 'text-pictus-lime border-b-2 border-pictus-lime'
                : 'text-gray-400 hover:text-pictus-white'
            }`}
          >
            <AlertCircle size={20} />
            Čakajúce ({dutyBatches.filter(b => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`flex items-center gap-2 px-4 py-3 text-lg font-light transition-all ${
              statusFilter === 'completed'
                ? 'text-pictus-lime border-b-2 border-pictus-lime'
                : 'text-gray-400 hover:text-pictus-white'
            }`}
          >
            <Check size={20} />
            Dokončené
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex items-center gap-2 px-4 py-3 text-lg font-light transition-all ${
              statusFilter === 'all'
                ? 'text-pictus-lime border-b-2 border-pictus-lime'
                : 'text-gray-400 hover:text-pictus-white'
            }`}
          >
            <Calendar size={20} />
            Všetky ({dutyBatches.length})
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Renewals List */}
      {dutyBatches.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <RotateCcw className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-light text-gray-400 mb-2">
            {statusFilter === 'pending'
              ? 'Žiadne čakajúce obnovy'
              : statusFilter === 'completed'
              ? 'Žiadne dokončené obnovy'
              : 'Žiadne obnovy'}
          </h3>
          <p className="text-gray-500">
            {statusFilter === 'pending'
              ? 'Momentálne nie sú žiadne úlohy, ktoré by potrebovali obnovu'
              : 'Neexistujú žiadne dokončené obnovy'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {dutyBatches.map((batch) => (
            <RenewalCard
              key={batch.dutyBatchId}
              dutyBatch={batch}
              onRenewalSuccess={handleRenewalSuccess}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default RenewalsContent
