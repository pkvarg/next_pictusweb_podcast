interface LogContext {
  component?: string
  function?: string
  props?: any
  error?: any
  stack?: string
  timestamp?: string
  [key: string]: any
}

class ProdLogger {
  private static instance: ProdLogger
  private isDev = process.env.NODE_ENV === 'development'

  static getInstance(): ProdLogger {
    if (!ProdLogger.instance) {
      ProdLogger.instance = new ProdLogger()
    }
    return ProdLogger.instance
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const formattedContext = context ? JSON.stringify(context, null, 2) : ''
    return `[${timestamp}] [${level}] ${message}${formattedContext ? '\n' + formattedContext : ''}`
  }

  info(message: string, context?: LogContext) {
    // Disabled to reduce log noise - only keep for critical debugging
    // if (this.isDev) {
    //   const formatted = this.formatMessage('INFO', message, context)
    //   console.log(formatted)
    // }
    
    // In production, only send critical info to external logging service if needed
    if (!this.isDev) {
      // You can add external logging service here (e.g., Sentry, LogRocket, etc.)
    }
  }

  warn(message: string, context?: LogContext) {
    const formatted = this.formatMessage('WARN', message, context)
    console.warn(formatted)
    
    if (!this.isDev) {
      // External logging for warnings
    }
  }

  error(message: string, context?: LogContext) {
    const formatted = this.formatMessage('ERROR', message, context)
    console.error(formatted)
    
    if (!this.isDev) {
      // External logging for errors
    }
  }

  serverComponentStart(componentName: string, props?: any) {
    // Disabled to reduce log noise
    // if (this.isDev) {
    //   this.info(`Server Component Render Start: ${componentName}`, {
    //     component: componentName,
    //     props: props ? Object.keys(props) : undefined,
    //     type: 'server-component-start'
    //   })
    // }
  }

  serverComponentEnd(componentName: string) {
    // Disabled to reduce log noise
    // if (this.isDev) {
    //   this.info(`Server Component Render End: ${componentName}`, {
    //     component: componentName,
    //     type: 'server-component-end'
    //   })
    // }
  }

  dynamicUsage(componentName: string, api: string, stack?: string) {
    this.error(`DYNAMIC SERVER USAGE DETECTED: ${componentName}`, {
      component: componentName,
      dynamicAPI: api,
      stack: stack || new Error().stack,
      type: 'dynamic-server-usage'
    })
  }

  hookUsage(componentName: string, hookName: string) {
    this.warn(`Hook usage in component: ${componentName}`, {
      component: componentName,
      hook: hookName,
      type: 'hook-usage'
    })
  }
}

export const prodLogger = ProdLogger.getInstance()

// Helper function to wrap server components with logging
export function withServerLogging<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function LoggedComponent(props: T) {
    prodLogger.serverComponentStart(componentName, props)
    
    try {
      const result = Component(props)
      prodLogger.serverComponentEnd(componentName)
      return result
    } catch (error) {
      prodLogger.error(`Error in server component: ${componentName}`, {
        component: componentName,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        props: props ? Object.keys(props) : undefined
      })
      throw error
    }
  }
}

// Helper to detect dynamic usage
export function detectDynamicUsage(componentName: string) {
  const originalConsoleError = console.error
  
  console.error = (...args) => {
    const message = args[0]
    if (typeof message === 'string' && message.includes('DYNAMIC_SERVER_USAGE')) {
      prodLogger.dynamicUsage(componentName, 'unknown', new Error().stack)
    }
    originalConsoleError.apply(console, args)
  }
  
  return () => {
    console.error = originalConsoleError
  }
}