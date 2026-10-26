import AdminLayout from '@/app/components/admin/AdminLayout'
import DismissedRenewals from '@/app/components/admin/DismissedRenewals'
import React from 'react'

const DismissedRenewalsAdmin = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dismissed Renewals</h1>
          <p className="text-gray-400 mt-2">
            Restore renewal suggestions a client has dismissed. Restoring makes the renewal visible
            again and re-enables its PDR reminder.
          </p>
        </div>
        <DismissedRenewals />
      </div>
    </AdminLayout>
  )
}

export default DismissedRenewalsAdmin
