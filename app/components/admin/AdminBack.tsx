'use client'
import { Link } from '@/i18n/routing'
import React from 'react'

const AdminBack = () => {
  return (
    <div className="mb-6">
      <Link href={`/admin`} className="text-pictus-lime hover:text-pictus-lime600 text-lg font-light transition-colors inline-flex items-center">
        ← Back To Admin
      </Link>
    </div>
  )
}

export default AdminBack
