'use client'

import { useEffect } from 'react'
import { setupGlobalErrorHandling, interceptConsoleErrors } from '@/lib/globalErrorHandler'

export default function ClientErrorHandler() {
  useEffect(() => {
    // Setup global error handling on the client side
    setupGlobalErrorHandling()
    const cleanup = interceptConsoleErrors()
    
    return cleanup
  }, [])

  return null
}