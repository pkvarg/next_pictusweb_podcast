import AdminLayout from '@/app/components/admin/AdminLayout'
import AllVehicleNotifications from '@/app/components/admin/AllVehicleNotifications'
import React from 'react'

const VehicleNotificationsAdmin = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicle Notifications Management</h1>
          <p className="text-gray-400 mt-2">Manage all vehicle notifications in the system</p>
        </div>
        <AllVehicleNotifications />
      </div>
    </AdminLayout>
  )
}

export default VehicleNotificationsAdmin