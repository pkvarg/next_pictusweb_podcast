import React from 'react'
import PictusLanding from '../components/home/pictus/PictusLanding'
import { prodLogger } from '@/lib/prodLogger'

const Home = () => {
  prodLogger.serverComponentStart('HomePage')

  try {
    const result = <PictusLanding />

    prodLogger.serverComponentEnd('HomePage')
    return result
  } catch (error) {
    prodLogger.error('Error in HomePage', {
      component: 'HomePage',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
}

export default Home
