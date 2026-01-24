'use client'
import React, { useState, useEffect } from 'react'
import { BarChart3, RefreshCw } from 'lucide-react'

export default function MetabaseDashboard() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmbedUrl = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/metabase-embed')
      if (response.ok) {
        const data = await response.json()
        setIframeUrl(data.iframeUrl)
      } else {
        setError('Failed to load dashboard')
      }
    } catch (err) {
      setError('Error loading dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmbedUrl()
  }, [])

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12">
        <div className="text-center">
          <div className="animate-spin mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Dashboard...</h3>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{error}</h3>
          <button
            onClick={fetchEmbedUrl}
            className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Metabase Analytics</h2>
        <button
          onClick={fetchEmbedUrl}
          className="inline-flex items-center px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>
      {iframeUrl && (
        <iframe
          src={iframeUrl}
          width="100%"
          height="800"
          className="bg-white border-0"
        />
      )}
    </div>
  )
}
