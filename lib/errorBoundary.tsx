'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { prodLogger } from './prodLogger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isDynamicError = error.message?.includes('DYNAMIC_SERVER_USAGE') || 
                          error.digest === 'DYNAMIC_SERVER_USAGE' ||
                          errorInfo.componentStack?.includes('DYNAMIC_SERVER_USAGE')

    if (isDynamicError) {
      prodLogger.error('DYNAMIC_SERVER_USAGE Error Caught in ErrorBoundary', {
        component: this.props.componentName || 'ErrorBoundary',
        error: error.message,
        digest: (error as any).digest,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        type: 'dynamic-server-usage-boundary'
      })
    } else {
      prodLogger.error('General Error Caught in ErrorBoundary', {
        component: this.props.componentName || 'ErrorBoundary',
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        type: 'general-error-boundary'
      })
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="error-boundary p-4 border border-red-500 rounded">
          <h2 className="text-red-500 text-xl font-bold">Something went wrong.</h2>
          <details className="mt-2">
            <summary>Error details</summary>
            <pre className="text-sm mt-2 p-2 bg-gray-100 rounded">
              {this.state.error?.message}
            </pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Higher-order component to wrap any component with error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary componentName={componentName}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}