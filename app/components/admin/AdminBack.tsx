'use client'
import { Link } from '@/i18n/routing'
import React from 'react'

const AdminBack = () => {
  return (
    <div className="text-[35px]">
      <Link href={`/admin`} className="text-green-500">
        Back To Admin
      </Link>
    </div>
  )
}

export default AdminBack
