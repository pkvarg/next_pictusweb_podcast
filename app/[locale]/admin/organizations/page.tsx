import AdminLayout from '@/app/components/admin/AdminLayout'
import OrganizationManager from '@/app/components/admin/OrganizationManager'
import React from 'react'

const OrganizationsAdmin = () => {
  return (
    <AdminLayout>
      <OrganizationManager />
    </AdminLayout>
  )
}

export default OrganizationsAdmin
