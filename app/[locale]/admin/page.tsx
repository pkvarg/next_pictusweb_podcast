import AdminLayout from '@/app/components/admin/AdminLayout'
import AdminDashboard from '@/app/components/admin/AdminDashboard'
import AllPodcasts from '@/app/components/admin/AllPodcasts'
import React from 'react'

const Admin = () => {
  return (
    <AdminLayout>
      <AdminDashboard />
      <div className="mt-8">
        <AllPodcasts />
      </div>
    </AdminLayout>
  )
}

export default Admin
