'use client'

import { useState, useEffect } from 'react'
import { Newspaper, Send, Eye, X } from 'lucide-react'
import { formatContent, buildPreviewHtml } from '@/lib/releaseEmailTemplate'

interface Organization {
  id: string
  name: string
  mainContact: string | null
  newsletterOptOut: boolean
  tierRelation: {
    name: string
  } | null
  stripeSubscriptionStatus: string | null
  freeTrialEndDate: string | null
}

export default function ReleaseNotesManager() {
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const eligibleOrgs = organizations.filter(
    (org) => !org.newsletterOptOut && org.mainContact && org.mainContact.trim() !== ''
  )

  const filteredOrgs = eligibleOrgs.filter(
    (org) => tierFilter === 'all' || org.tierRelation?.name === tierFilter
  )

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    const allFilteredIds = filteredOrgs.map((o) => o.id)
    const allSelected = allFilteredIds.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        allFilteredIds.forEach((id) => next.delete(id))
      } else {
        allFilteredIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const getOrgStatus = (org: Organization) => {
    if (org.stripeSubscriptionStatus === 'active') return 'active'
    if (org.freeTrialEndDate) return 'trial'
    return 'free'
  }

  const handleSend = async () => {
    if (!subject || !htmlContent) {
      alert('Please fill in subject and content')
      return
    }
    if (selectedIds.size === 0) {
      alert('Please select at least one recipient')
      return
    }
    if (!confirm(`Send newsletter to ${selectedIds.size} recipient(s)?`)) return

    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/release-notes/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          htmlContent: formatContent(htmlContent),
          organizationIds: Array.from(selectedIds),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to send' }))
        alert(data.error || 'Failed to send newsletter')
      }
    } catch (error) {
      console.error('Failed to send newsletter:', error)
      alert('Error sending newsletter')
    } finally {
      setSending(false)
    }
  }

  const allFilteredSelected = filteredOrgs.length > 0 && filteredOrgs.every((o) => selectedIds.has(o.id))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Newspaper className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-white">Release Notes Newsletter</h2>
      </div>

      {/* Section A: Compose */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4">
        <h3 className="text-lg font-medium text-white">Compose</h3>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="FleetSync — Novinky v2.1"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">HTML Content</label>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            rows={16}
            placeholder="<h1>What's new in FleetSync</h1>&#10;<p>...</p>"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm font-mono focus:outline-none focus:border-blue-500 resize-y"
          />
          <p className="text-xs text-gray-500 mt-1">
            The unsubscribe link is automatically included in the email template footer.
          </p>
        </div>

        <button
          onClick={() => setShowPreview(true)}
          disabled={!htmlContent}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Section B: Recipients */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-lg font-medium text-white">
            Recipients
            <span className="text-sm text-gray-400 ml-2">
              ({selectedIds.size} selected)
            </span>
          </h3>

          <div className="flex items-center gap-3">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Tiers</option>
              <option value="FREE">FREE</option>
              <option value="BASIC">BASIC</option>
              <option value="BUSINESS">BUSINESS</option>
            </select>

            <button
              onClick={toggleAll}
              className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              {allFilteredSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500 py-4">Loading organizations...</div>
        ) : filteredOrgs.length === 0 ? (
          <div className="text-gray-400 py-4">No eligible organizations found.</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-2">
              {filteredOrgs.map((org) => (
                <label
                  key={org.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedIds.has(org.id)
                      ? 'bg-blue-900/20 border-blue-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(org.id)}
                    onChange={() => toggleSelect(org.id)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">{org.name}</div>
                    <div className="text-xs text-gray-400 truncate">{org.mainContact}</div>
                    <div className="flex gap-2 mt-1 text-xs text-gray-500">
                      <span>{org.tierRelation?.name || 'N/A'}</span>
                      <span>{getOrgStatus(org)}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-3 text-sm font-medium text-gray-400 w-10">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500"
                      />
                    </th>
                    <th className="pb-3 text-sm font-medium text-gray-400">Organization</th>
                    <th className="pb-3 text-sm font-medium text-gray-400">Main Contact</th>
                    <th className="pb-3 text-sm font-medium text-gray-400">Tier</th>
                    <th className="pb-3 text-sm font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgs.map((org) => (
                    <tr
                      key={org.id}
                      onClick={() => toggleSelect(org.id)}
                      className={`border-b border-gray-800 cursor-pointer transition-colors ${
                        selectedIds.has(org.id) ? 'bg-blue-900/10' : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(org.id)}
                          onChange={() => toggleSelect(org.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500"
                        />
                      </td>
                      <td className="py-3 text-sm text-white">{org.name}</td>
                      <td className="py-3 text-sm text-gray-300">{org.mainContact}</td>
                      <td className="py-3 text-sm text-gray-300">{org.tierRelation?.name || 'N/A'}</td>
                      <td className="py-3 text-sm text-gray-300 capitalize">{getOrgStatus(org)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Section C: Send */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={handleSend}
            disabled={sending || !subject || !htmlContent || selectedIds.size === 0}
            className="flex items-center gap-1.5 px-6 py-2.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : `Send Newsletter (${selectedIds.size})`}
          </button>

          {result && (
            <div className="text-sm">
              <span className="text-green-400">Sent: {result.sent}</span>
              {result.failed > 0 && (
                <span className="text-red-400 ml-3">Failed: {result.failed}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
            <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Email Preview</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-gray-800/50 border-b border-gray-700 text-sm text-gray-300">
              <strong>Subject:</strong> {subject || '(no subject)'}
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              <iframe
                srcDoc={buildPreviewHtml(formatContent(htmlContent), subject)}
                title="Email preview"
                className="w-full border-0"
                style={{ minHeight: '600px', height: '70vh' }}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
