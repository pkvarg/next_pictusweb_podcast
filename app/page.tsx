import { redirect } from 'next/navigation'
import React from 'react'
import { prodLogger } from '@/lib/prodLogger'

const page = () => {
  prodLogger.serverComponentStart('RootPage')
  prodLogger.info('RootPage: redirecting to /sk')
  
  try {
    redirect('/sk')
  } catch (error) {
    prodLogger.error('Error in RootPage redirect', {
      component: 'RootPage',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}

export default page
