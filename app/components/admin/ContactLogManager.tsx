'use client'
import React, { useState, useEffect } from 'react'
import {
  Mail,
  Search,
  Calendar,
  ShieldAlert,
  Globe,
  Monitor,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MessageSquare,
} from 'lucide-react'

interface ContactLog {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  message: string | null
  subject: string | null
  locale: string | null
  origin: string | null
  ipAddress: string | null
  userAgent: string | null
  referer: string | null
  acceptLanguage: string | null
  timeSpent: number | null
  emailSent: boolean
  createdAt: string
}

export default function ContactLogManager() {
  const [logs, setLogs] = useState<ContactLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [banningId, setBanningId] = useState<string | null>(null)
  const [bannedIPs, setBannedIPs] = useState<Set<string>>(new Set())
  const [confirmBanId, setConfirmBanId] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/contact-logs')
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Failed to fetch contact logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBannedIPs = async () => {
    try {
      const response = await fetch('/api/ip-bans')
      if (response.ok) {
        const data = await response.json()
        const ips = new Set<string>(data.bannedIPs?.map((b: { ip: string }) => b.ip) || [])
        setBannedIPs(ips)
      }
    } catch (error) {
      console.error('Failed to fetch banned IPs:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchBannedIPs()
  }, [])

  const handleMarkAsSpam = async (log: ContactLog) => {
    if (!log.ipAddress || log.ipAddress === 'Unknown') return

    setBanningId(log.id)
    try {
      const response = await fetch(`/api/contact-logs/${log.id}/mark-spam`, {
        method: 'POST',
      })

      if (response.ok) {
        setBannedIPs((prev) => new Set([...prev, log.ipAddress!]))
      } else {
        const data = await response.json()
        console.error('Failed to mark as spam:', data.error)
      }
    } catch (error) {
      console.error('Error marking as spam:', error)
    } finally {
      setBanningId(null)
      setConfirmBanId(null)
    }
  }

  const isIPBanned = (ip: string | null) => {
    if (!ip || ip === 'Unknown') return false
    return bannedIPs.has(ip)
  }

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (log.name && log.name.toLowerCase().includes(searchLower)) ||
      (log.email && log.email.toLowerCase().includes(searchLower)) ||
      (log.phone && log.phone.toLowerCase().includes(searchLower)) ||
      (log.message && log.message.toLowerCase().includes(searchLower)) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(searchLower)) ||
      (log.userAgent && log.userAgent.toLowerCase().includes(searchLower))
    )
  })

  const formatTime = (ms: number | null) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12">
        <div className="text-center">
          <div className="animate-spin mx-auto w-16 h-16 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-pictus-black" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Contact Logs...</h3>
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="h-8 w-8 text-pictus-black" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Contact Logs Yet</h3>
          <p className="text-gray-400">Contact form submissions will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Submissions</h2>
          <p className="text-gray-400 mt-1">
            {filteredLogs.length} submission{filteredLogs.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <span>Banned</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <span>Clean</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone, message, IP, or user agent..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Time Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLogs.map((log) => {
                const banned = isIPBanned(log.ipAddress)
                const isExpanded = expandedId === log.id

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`hover:bg-white/5 transition-colors cursor-pointer ${
                        banned ? 'bg-red-500/5' : ''
                      }`}
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                banned
                                  ? 'bg-red-500/20 border border-red-500/30'
                                  : 'bg-gradient-to-r from-pictus-lime to-pictus-lime600'
                              }`}
                            >
                              <span
                                className={`font-medium text-sm ${
                                  banned ? 'text-red-400' : 'text-pictus-black'
                                }`}
                              >
                                {(log.name?.[0] || log.email?.[0] || '?').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {log.name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {log.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-300">
                          <Globe className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-mono text-xs">
                            {log.ipAddress || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-300">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          <span
                            className={
                              log.timeSpent && log.timeSpent < 5000
                                ? 'text-yellow-400'
                                : ''
                            }
                          >
                            {formatTime(log.timeSpent)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {banned ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            Banned
                          </span>
                        ) : log.emailSent ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Logged
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {!banned && log.ipAddress && log.ipAddress !== 'Unknown' && (
                            <>
                              {confirmBanId === log.id ? (
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMarkAsSpam(log)
                                    }}
                                    disabled={banningId === log.id}
                                    className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                  >
                                    {banningId === log.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      'Confirm Ban'
                                    )}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setConfirmBanId(null)
                                    }}
                                    className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setConfirmBanId(log.id)
                                  }}
                                  className="inline-flex items-center px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                                  title="Mark as spam and ban IP"
                                >
                                  <ShieldAlert className="h-3 w-3 mr-1" />
                                  Mark Spam
                                </button>
                              )}
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedId(isExpanded ? null : log.id)
                            }}
                            className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded details row */}
                    {isExpanded && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-3">
                              <h4 className="text-white font-medium mb-2">Contact Details</h4>
                              <div>
                                <span className="text-gray-500">Name:</span>{' '}
                                <span className="text-gray-300">{log.name || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Email:</span>{' '}
                                <span className="text-gray-300">{log.email || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Phone:</span>{' '}
                                <span className="text-gray-300">{log.phone || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Subject:</span>{' '}
                                <span className="text-gray-300">{log.subject || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Message:</span>
                                <p className="text-gray-300 mt-1 bg-white/5 rounded p-2 whitespace-pre-wrap">
                                  {log.message || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h4 className="text-white font-medium mb-2">Request Metadata</h4>
                              <div>
                                <span className="text-gray-500">IP Address:</span>{' '}
                                <span className="text-gray-300 font-mono text-xs">
                                  {log.ipAddress || 'Unknown'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">User Agent:</span>
                                <p className="text-gray-300 mt-1 bg-white/5 rounded p-2 font-mono text-xs break-all">
                                  {log.userAgent || 'Unknown'}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Accept-Language:</span>{' '}
                                <span className="text-gray-300 font-mono text-xs">
                                  {log.acceptLanguage || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Referer:</span>{' '}
                                <span className="text-gray-300 font-mono text-xs">
                                  {log.referer || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div>
                                  <span className="text-gray-500">Locale:</span>{' '}
                                  <span className="text-gray-300">{log.locale || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Origin:</span>{' '}
                                  <span className="text-gray-300">{log.origin || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Time Spent:</span>{' '}
                                  <span className="text-gray-300">
                                    {formatTime(log.timeSpent)}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">ID:</span>{' '}
                                <span className="text-gray-300 font-mono text-xs">{log.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
