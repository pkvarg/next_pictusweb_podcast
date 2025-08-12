import { redirect } from 'next/navigation'
import React from 'react'
import { prodLogger } from '@/lib/prodLogger'

const page = () => {
  prodLogger.serverComponentStart('RootPage')
  prodLogger.info('RootPage: redirecting to /sk')
  
  try {
    redirect('/sk')
  } catch (error) {
    // NEXT_REDIRECT is expected behavior, don't log as error
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      prodLogger.info('RootPage: redirect executed successfully')
    } else {
      prodLogger.error('Error in RootPage redirect', {
        component: 'RootPage',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
    }
    throw error
  }
}

export default page
