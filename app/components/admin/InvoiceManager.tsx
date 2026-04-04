'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Mail, Plus, X } from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  organizationName: string
  street: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  ico: string | null
  dic: string | null
  firstName: string
  lastName: string
  email: string
  tier: string
  billing: string
  numberOfVehicles: number
  pricePerVehicle: number
  totalPrice: number
  createdAt: string
}

interface Organization {
  id: string
  name: string
  mainContact: string | null
  street: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  ico: string | null
  dic: string | null
  billingInterval: string | null
  currentVehiclesCount: number
  tierRelation: {
    name: string
    pricePerVehicle: number | null
    pricePerVehicleYearly: number | null
  } | null
}

interface CreateInvoiceForm {
  organizationName: string
  street: string
  city: string
  postalCode: string
  country: string
  ico: string
  dic: string
  firstName: string
  lastName: string
  email: string
  tier: string
  billing: string
  numberOfVehicles: string
  pricePerVehicle: string
  totalPrice: string
  paymentType: string
  locale: string
  sendEmail: boolean
}

const emptyForm: CreateInvoiceForm = {
  organizationName: '',
  street: '',
  city: '',
  postalCode: '',
  country: '',
  ico: '',
  dic: '',
  firstName: '',
  lastName: '',
  email: '',
  tier: '',
  billing: 'monthly',
  numberOfVehicles: '1',
  pricePerVehicle: '',
  totalPrice: '',
  paymentType: 'stripe',
  locale: 'sk',
  sendEmail: true,
}

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [form, setForm] = useState<CreateInvoiceForm>({ ...emptyForm })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

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

  const handleSendEmail = async (invoice: Invoice) => {
    if (!confirm(`Send invoice ${invoice.invoiceNumber} to ${invoice.email}?`)) return

    setSendingId(invoice.id)
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: 'POST',
      })
      if (response.ok) {
        alert(`Invoice sent to ${invoice.email}`)
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to send' }))
        alert(data.error || 'Failed to send invoice')
      }
    } catch (error) {
      console.error('Failed to send invoice:', error)
      alert('Error sending invoice')
    } finally {
      setSendingId(null)
    }
  }

  const openCreateModal = async () => {
    setForm({ ...emptyForm })
    setCreateError(null)
    setShowModal(true)

    try {
      const response = await fetch('/api/organizations')
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    }
  }

  const handleOrgSelect = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId)
    if (!org) return

    const billing = org.billingInterval || 'monthly'
    const pricePerVehicle =
      billing === 'yearly'
        ? Number(org.tierRelation?.pricePerVehicleYearly || 0)
        : Number(org.tierRelation?.pricePerVehicle || 0)
    const numberOfVehicles = org.currentVehiclesCount || 1

    setForm((prev) => ({
      ...prev,
      organizationName: org.name,
      street: org.street || '',
      city: org.city || '',
      postalCode: org.postalCode || '',
      country: org.country || '',
      ico: org.ico || '',
      dic: org.dic || '',
      email: org.mainContact || '',
      tier: org.tierRelation?.name || '',
      billing,
      numberOfVehicles: String(numberOfVehicles),
      pricePerVehicle: String(pricePerVehicle),
      totalPrice: String(numberOfVehicles * pricePerVehicle),
    }))
  }

  const updateForm = (field: keyof CreateInvoiceForm, value: string | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'numberOfVehicles' || field === 'pricePerVehicle') {
        const vehicles = parseFloat(updated.numberOfVehicles) || 0
        const price = parseFloat(updated.pricePerVehicle) || 0
        updated.totalPrice = String(+(vehicles * price).toFixed(2))
      }
      return updated
    })
  }

  const handleCreateInvoice = async () => {
    setCreating(true)
    setCreateError(null)

    try {
      const response = await fetch('/api/invoices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          numberOfVehicles: parseInt(form.numberOfVehicles) || 0,
          pricePerVehicle: parseFloat(form.pricePerVehicle) || 0,
          totalPrice: parseFloat(form.totalPrice) || 0,
        }),
      })

      if (response.ok) {
        setShowModal(false)
        await fetchInvoices()
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to create invoice' }))
        setCreateError(data.error || 'Failed to create invoice')
      }
    } catch (error) {
      console.error('Failed to create invoice:', error)
      setCreateError('Failed to create invoice')
    } finally {
      setCreating(false)
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
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
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
                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(invoice)}
                    disabled={downloadingId === invoice.id}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors flex-1 justify-center"
                  >
                    <Download className="w-4 h-4" />
                    {downloadingId === invoice.id ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => handleSendEmail(invoice)}
                    disabled={sendingId === invoice.id}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-sm bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:opacity-50 text-white rounded-lg transition-colors flex-1 justify-center"
                  >
                    <Mail className="w-4 h-4" />
                    {sendingId === invoice.id ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(invoice)}
                          disabled={downloadingId === invoice.id}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          {downloadingId === invoice.id ? 'Generating...' : 'Download'}
                        </button>
                        <button
                          onClick={() => handleSendEmail(invoice)}
                          disabled={sendingId === invoice.id}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-amber-600 hover:bg-amber-700 disabled:bg-amber-800 disabled:opacity-50 text-white rounded transition-colors"
                        >
                          <Mail className="w-3 h-3" />
                          {sendingId === invoice.id ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Create Invoice</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Organization Select */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Select Organization</label>
                <select
                  onChange={(e) => handleOrgSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  defaultValue=""
                >
                  <option value="" disabled>Choose organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Organization Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={form.organizationName}
                    onChange={(e) => updateForm('organizationName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => updateForm('firstName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => updateForm('lastName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Street */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Street</label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => updateForm('street', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => updateForm('postalCode', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => updateForm('country', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* ICO */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">ICO</label>
                  <input
                    type="text"
                    value={form.ico}
                    onChange={(e) => updateForm('ico', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* DIC */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">DIC</label>
                  <input
                    type="text"
                    value={form.dic}
                    onChange={(e) => updateForm('dic', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Tier */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tier</label>
                  <select
                    value={form.tier}
                    onChange={(e) => updateForm('tier', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>Select tier...</option>
                    <option value="FREE">FREE</option>
                    <option value="BASIC">BASIC</option>
                    <option value="BUSINESS">BUSINESS</option>
                  </select>
                </div>

                {/* Billing */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Billing</label>
                  <select
                    value={form.billing}
                    onChange={(e) => updateForm('billing', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Payment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Payment Type</label>
                  <select
                    value={form.paymentType}
                    onChange={(e) => updateForm('paymentType', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="stripe">Stripe (karta)</option>
                    <option value="faktura">Faktúra (bankový prevod)</option>
                  </select>
                </div>

                {/* Number of Vehicles */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Number of Vehicles</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.numberOfVehicles}
                    onChange={(e) => updateForm('numberOfVehicles', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Price per Vehicle */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Price per Vehicle (EUR)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.pricePerVehicle}
                    onChange={(e) => updateForm('pricePerVehicle', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Total Price (auto-calculated, editable) */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Total Price (EUR)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.totalPrice}
                    onChange={(e) => updateForm('totalPrice', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Locale */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Locale</label>
                  <select
                    value={form.locale}
                    onChange={(e) => updateForm('locale', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="sk">SK</option>
                    <option value="en">EN</option>
                    <option value="hu">HU</option>
                  </select>
                </div>
              </div>

              {/* Send Email Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sendEmail}
                  onChange={(e) => updateForm('sendEmail', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Send invoice email</span>
              </label>

              {createError && (
                <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
                  {createError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                disabled={creating || !form.organizationName || !form.email}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {creating ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
