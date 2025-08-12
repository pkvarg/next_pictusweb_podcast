import { prodLogger } from './prodLogger'

// Global error handler for uncaught errors
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason
      const isDynamicError = error?.message?.includes('DYNAMIC_SERVER_USAGE') || 
                            error?.digest === 'DYNAMIC_SERVER_USAGE'

      if (isDynamicError) {
        prodLogger.error('Unhandled DYNAMIC_SERVER_USAGE Promise Rejection', {
          error: error?.message || String(error),
          digest: error?.digest,
          stack: error?.stack,
          type: 'unhandled-dynamic-server-usage'
        })
      } else {
        prodLogger.error('Unhandled Promise Rejection', {
          error: error?.message || String(error),
          stack: error?.stack,
          type: 'unhandled-promise-rejection'
        })
      }
    })

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      const error = event.error
      const isDynamicError = error?.message?.includes('DYNAMIC_SERVER_USAGE') || 
                            error?.digest === 'DYNAMIC_SERVER_USAGE'

      if (isDynamicError) {
        prodLogger.error('Uncaught DYNAMIC_SERVER_USAGE Error', {
          error: error?.message || event.message,
          digest: error?.digest,
          stack: error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'uncaught-dynamic-server-usage'
        })
      } else {
        prodLogger.error('Uncaught Error', {
          error: error?.message || event.message,
          stack: error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'uncaught-error'
        })
      }
    })
  }

  // Server-side error handling
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error) => {
      const isDynamicError = error.message?.includes('DYNAMIC_SERVER_USAGE') || 
                            (error as any).digest === 'DYNAMIC_SERVER_USAGE'

      if (isDynamicError) {
        prodLogger.error('Uncaught DYNAMIC_SERVER_USAGE Exception (Server)', {
          error: error.message,
          digest: (error as any).digest,
          stack: error.stack,
          type: 'uncaught-dynamic-server-usage-server'
        })
      } else {
        prodLogger.error('Uncaught Exception (Server)', {
          error: error.message,
          stack: error.stack,
          type: 'uncaught-exception-server'
        })
      }
    })

    process.on('unhandledRejection', (reason, promise) => {
      const error = reason as Error
      const isDynamicError = error?.message?.includes('DYNAMIC_SERVER_USAGE') || 
                            (error as any)?.digest === 'DYNAMIC_SERVER_USAGE'

      if (isDynamicError) {
        prodLogger.error('Unhandled DYNAMIC_SERVER_USAGE Rejection (Server)', {
          error: error?.message || String(reason),
          digest: (error as any)?.digest,
          stack: error?.stack,
          type: 'unhandled-dynamic-server-usage-rejection-server'
        })
      } else {
        prodLogger.error('Unhandled Rejection (Server)', {
          error: error?.message || String(reason),
          stack: error?.stack,
          type: 'unhandled-rejection-server'
        })
      }
    })
  }
}

// Console error interceptor to catch Next.js internal errors
export function interceptConsoleErrors() {
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  console.error = (...args) => {
    const message = args[0]
    
    if (typeof message === 'string') {
      if (message.includes('DYNAMIC_SERVER_USAGE')) {
        prodLogger.error('Console Error: DYNAMIC_SERVER_USAGE detected', {
          message,
          args: args.slice(1),
          stack: new Error().stack,
          type: 'console-dynamic-server-usage'
        })
      } else if (message.includes('Server Components render')) {
        prodLogger.error('Console Error: Server Component Error', {
          message,
          args: args.slice(1),
          stack: new Error().stack,
          type: 'console-server-component-error'
        })
      }
    }

    // Call the original console.error
    originalConsoleError.apply(console, args)
  }

  console.warn = (...args) => {
    const message = args[0]
    
    if (typeof message === 'string') {
      if (message.includes('DYNAMIC_SERVER_USAGE')) {
        prodLogger.warn('Console Warning: DYNAMIC_SERVER_USAGE detected', {
          message,
          args: args.slice(1),
          stack: new Error().stack,
          type: 'console-dynamic-server-usage-warning'
        })
      }
    }

    // Call the original console.warn
    originalConsoleWarn.apply(console, args)
  }

  return () => {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
  }
}