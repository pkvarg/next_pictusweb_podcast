'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'

const AdminBack = () => {
  const { locale } = useParams()
  return (
    <div className='p-4 text-[25px]'>
      <Link href={`/${locale}/admin`} className='text-white'>
        Back To Admin
      </Link>
    </div>
  )
}

export default AdminBack
