import AdminLayout from '@/app/components/admin/AdminLayout'
import AllUsers from '@/app/components/admin/AllUsers'
import React from 'react'

const UsersAdmin = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-2">Manage all users in the system</p>
        </div>
        <AllUsers />
      </div>
    </AdminLayout>
  )
}

export default UsersAdmin