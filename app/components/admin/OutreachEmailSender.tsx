'use client'

import { useMemo, useState } from 'react'
import { Send, Eye, X, Mail } from 'lucide-react'
import { formatContent, buildPreviewHtml } from '@/lib/releaseEmailTemplate'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Split a free-text blob into individual addresses (comma / semicolon / whitespace / newline).
function parseEmails(input: string): { valid: string[]; invalid: string[] } {
  const tokens = input
    .split(/[\s,;]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
  const valid: string[] = []
  const invalid: string[] = []
  const seen = new Set<string>()
  for (const t of tokens) {
    if (!EMAIL_RE.test(t)) {
      invalid.push(t)
      continue
    }
    if (seen.has(t)) continue
    seen.add(t)
    valid.push(t)
  }
  return { valid, invalid }
}

export default function OutreachEmailSender() {
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [recipientsRaw, setRecipientsRaw] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; invalid?: string[] } | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const { valid, invalid } = useMemo(() => parseEmails(recipientsRaw), [recipientsRaw])

  const handleSend = async () => {
    if (!subject || !htmlContent) {
      alert('Please fill in subject and content')
      return
    }
    if (valid.length === 0) {
      alert('Please enter at least one valid email address')
      return
    }
    if (!confirm(`Send this email to ${valid.length} recipient(s)?`)) return

    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          htmlContent: formatContent(htmlContent),
          emails: valid,
        }),
      })

      if (response.ok) {
        setResult(await response.json())
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to send' }))
        alert(data.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Failed to send outreach email:', error)
      alert('Error sending email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Mail className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-white">Outreach Email</h2>
      </div>
      <p className="text-sm text-gray-400 -mt-4">
        Send the same styled Pictusweb email to any addresses you type in (e.g. cold outreach to
        prospects). Recipients are not stored.
      </p>

      {/* Compose */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4">
        <h3 className="text-lg font-medium text-white">Compose</h3>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="FleetSync — pripomienky a prehľad nákladov vozového parku"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">HTML Content</label>
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            rows={16}
            placeholder="<h1>Dobrý deň</h1>&#10;<p>...</p>"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm font-mono focus:outline-none focus:border-blue-500 resize-y"
          />
          <p className="text-xs text-gray-500 mt-1">
            Plain text is auto-wrapped in paragraphs. The Pictusweb header, styling and footer are
            added automatically.
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

      {/* Recipients */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-3">
        <h3 className="text-lg font-medium text-white">
          Recipients
          <span className="text-sm text-gray-400 ml-2">({valid.length} valid)</span>
        </h3>
        <textarea
          value={recipientsRaw}
          onChange={(e) => setRecipientsRaw(e.target.value)}
          rows={4}
          placeholder="petr.marek@fcc-group.sk, info@deltanz.sk&#10;office@example.com"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm font-mono focus:outline-none focus:border-blue-500 resize-y"
        />
        <p className="text-xs text-gray-500">
          Separate addresses with commas, spaces or new lines. Duplicates are removed automatically.
        </p>
        {valid.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {valid.map((e) => (
              <span
                key={e}
                className="px-2 py-0.5 text-xs bg-blue-900/30 border border-blue-500/30 text-blue-200 rounded"
              >
                {e}
              </span>
            ))}
          </div>
        )}
        {invalid.length > 0 && (
          <p className="text-xs text-red-400">
            Ignored (invalid): {invalid.join(', ')}
          </p>
        )}
      </div>

      {/* Send */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={handleSend}
            disabled={sending || !subject || !htmlContent || valid.length === 0}
            className="flex items-center gap-1.5 px-6 py-2.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : `Send Email (${valid.length})`}
          </button>

          {result && (
            <div className="text-sm">
              <span className="text-green-400">Sent: {result.sent}</span>
              {result.failed > 0 && <span className="text-red-400 ml-3">Failed: {result.failed}</span>}
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
                srcDoc={buildPreviewHtml(formatContent(htmlContent), subject, 'outreach')}
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
