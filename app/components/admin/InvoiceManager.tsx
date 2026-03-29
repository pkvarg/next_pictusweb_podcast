'use client'

import { useState, useEffect } from 'react'
import { FileText, Download } from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  organizationName: string
  email: string
  tier: string
  billing: string
  numberOfVehicles: number
  pricePerVehicle: number
  totalPrice: number
  createdAt: string
}

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (invoice: Invoice) => {
    setDownloadingId(invoice.id)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/regenerate`)
      if (!response.ok) {
        alert('Failed to generate invoice PDF')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fleetsync-faktura-${invoice.invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download invoice:', error)
      alert('Error downloading invoice')
    } finally {
      setDownloadingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sk-SK', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading invoices...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-white">Invoices</h2>
          <span className="text-sm text-gray-400">({invoices.length})</span>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No invoices found.</div>
      ) : (
        <>
          {/* Mobile Invoice Cards */}
          <div className="md:hidden space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                {/* Top row: invoice number + total */}
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono text-sm font-medium">{invoice.invoiceNumber}</span>
                  <span className="text-white font-medium">{formatPrice(invoice.totalPrice)}</span>
                </div>
                {/* Organization + email */}
                <div>
                  <div className="text-sm text-white">{invoice.organizationName}</div>
                  <div className="text-xs text-gray-400 truncate">{invoice.email}</div>
                </div>
                {/* Details row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                  <span className="capitalize">{invoice.tier}</span>
                  <span className="capitalize">{invoice.billing}</span>
                  <span>{invoice.numberOfVehicles} vehicles</span>
                  <span>{formatDate(invoice.createdAt)}</span>
                </div>
                {/* Download button */}
                <button
                  onClick={() => handleDownload(invoice)}
                  disabled={downloadingId === invoice.id}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors w-full justify-center"
                >
                  <Download className="w-4 h-4" />
                  {downloadingId === invoice.id ? 'Generating...' : 'Download PDF'}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop Invoice Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-sm font-medium text-gray-400">Invoice #</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Organization</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Email</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Tier</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Billing</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Vehicles</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Total</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Date</th>
                  <th className="pb-3 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 text-sm text-white font-mono">{invoice.invoiceNumber}</td>
                    <td className="py-3 text-sm text-white">{invoice.organizationName}</td>
                    <td className="py-3 text-sm text-gray-300">{invoice.email}</td>
                    <td className="py-3 text-sm text-gray-300 capitalize">{invoice.tier}</td>
                    <td className="py-3 text-sm text-gray-300 capitalize">{invoice.billing}</td>
                    <td className="py-3 text-sm text-gray-300">{invoice.numberOfVehicles}</td>
                    <td className="py-3 text-sm text-white font-medium">{formatPrice(invoice.totalPrice)}</td>
                    <td className="py-3 text-sm text-gray-300">{formatDate(invoice.createdAt)}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDownload(invoice)}
                        disabled={downloadingId === invoice.id}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        {downloadingId === invoice.id ? 'Generating...' : 'Download'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
