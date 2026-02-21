import AdminLayout from '@/app/components/admin/AdminLayout'
import ContactLogManager from '@/app/components/admin/ContactLogManager'
import React from 'react'

const ContactLogsAdmin = () => {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Contact Logs</h1>
          <p className="text-gray-400 mt-2">
            Review contact form submissions and identify spam
          </p>
        </div>
        <ContactLogManager />
      </div>
    </AdminLayout>
  )
}

export default ContactLogsAdmin
