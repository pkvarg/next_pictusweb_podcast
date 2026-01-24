import AdminLayout from '@/app/components/admin/AdminLayout'
import MetabaseDashboard from '@/app/components/admin/MetabaseDashboard'
import React from 'react'

const DashboardPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-2">View detailed analytics from Metabase</p>
        </div>
        <MetabaseDashboard />
      </div>
    </AdminLayout>
  )
}

export default DashboardPage
