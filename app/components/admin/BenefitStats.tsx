'use client'
import React, { useState, useEffect } from 'react'
import {
  Users,
  Car,
  Bell,
  UserCheck,
  Clock,
  XCircle,
  Loader2,
  Gift,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface BenefitUser {
  userId: string
  name: string
  email: string
  subOrgId: string | null
  vehiclesCount: number
  notificationsUsed: number
  active: boolean
  gdprAccepted: boolean
  subOrgActive: boolean
}

interface BenefitStatsProps {
  organizationId: string
}

export default function BenefitStats({ organizationId }: BenefitStatsProps) {
  const t = useTranslations('Client')
  const [benefitUsers, setBenefitUsers] = useState<BenefitUser[]>([])
  const [totalVehicles, setTotalVehicles] = useState(0)
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/fleetsync/benefit-stats?organizationId=${organizationId}`)
      if (res.ok) {
        const data = await res.json()
        setBenefitUsers(data.benefitUsers || [])
        setTotalVehicles(data.totalBenefitVehicles || 0)
        setTotalNotifications(data.totalBenefitNotifications || 0)
      }
    } catch (error) {
      console.error('Failed to fetch benefit stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [organizationId])

  const handleRevoke = async (userId: string) => {
    setRevoking(userId)
    try {
      const res = await fetch('/api/fleetsync/benefit-revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, organizationId }),
      })
      if (res.ok) {
        await fetchStats()
      }
    } catch (error) {
      console.error('Failed to revoke benefit:', error)
    } finally {
      setRevoking(null)
      setConfirmRevoke(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-pictus-lime mr-2" />
          <span className="text-gray-400">{t('benefitLoadingUsers')}</span>
        </div>
      </div>
    )
  }

  if (benefitUsers.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex items-center mb-4">
          <Gift className="h-5 w-5 text-pictus-lime mr-2" />
          <h3 className="text-lg font-semibold text-white">{t('benefitUsersTitle')}</h3>
        </div>
        <p className="text-gray-400 text-sm">
          {t('benefitNoUsers')}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Gift className="h-5 w-5 text-pictus-lime mr-2" />
          <h3 className="text-lg font-semibold text-white">{t('benefitUsersTitle')}</h3>
          <span className="ml-2 text-sm text-gray-400">({benefitUsers.length})</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center">
            <Car className="h-4 w-4 mr-1" />
            {t('benefitVehicles', { count: totalVehicles })}
          </span>
          <span className="flex items-center">
            <Bell className="h-4 w-4 mr-1" />
            {t('benefitNotifications', { count: totalNotifications })}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">{t('benefitName')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">{t('benefitEmail')}</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase">{t('benefitVehiclesColumn')}</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase">{t('benefitNotificationsColumn')}</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase">{t('benefitStatus')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-300 uppercase">{t('benefitActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {benefitUsers.map((user) => (
              <tr key={user.userId} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-sm text-white">{user.name}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{user.email}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-300">
                  <span className="flex items-center justify-center">
                    <Car className="h-3 w-3 mr-1 text-gray-400" />
                    {user.vehiclesCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-300">
                  <span className="flex items-center justify-center">
                    <Bell className="h-3 w-3 mr-1 text-gray-400" />
                    {user.notificationsUsed}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {user.active ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                      <UserCheck className="h-3 w-3 mr-1" />
                      {t('benefitActive')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      <Clock className="h-3 w-3 mr-1" />
                      {t('benefitPending')}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {confirmRevoke === user.userId ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-gray-400">{t('benefitConfirmRevoke')}</span>
                      <button
                        onClick={() => handleRevoke(user.userId)}
                        disabled={revoking === user.userId}
                        className="text-xs px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 disabled:opacity-50"
                      >
                        {revoking === user.userId ? t('benefitRevoking') : t('benefitYes')}
                      </button>
                      <button
                        onClick={() => setConfirmRevoke(null)}
                        className="text-xs px-2 py-1 text-gray-400 hover:text-white"
                      >
                        {t('benefitNo')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRevoke(user.userId)}
                      className="text-red-400 hover:text-red-300 p-1 rounded"
                      title={t('benefitRevoke')}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
