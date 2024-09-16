'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React from 'react'

const AdminBack = () => {
  const { locale } = useParams()
  return (
    <div className='text-[35px]'>
      <Link href={`/${locale}/admin`} className='text-green-500'>
        Back To Admin
      </Link>
    </div>
  )
}

export default AdminBack
