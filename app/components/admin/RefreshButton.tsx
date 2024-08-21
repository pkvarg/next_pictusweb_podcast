'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

const RefreshButton = () => {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <button
      className='cursor-pointer text-yellow-500 ml-2 lg:ml-12'
      onClick={handleRefresh}
    >
      Cannot see your updates? Click here to refresh page
    </button>
  )
}

export default RefreshButton
