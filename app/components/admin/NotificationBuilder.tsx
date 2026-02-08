'use client'

import { useState, useEffect } from 'react'
import {
  Bell,
  Calendar,
  Mail,
  MessageSquare,
  Car,
  User,
  Building,
  Phone,
  Save,
  Copy,
  Sparkles,
  X,
} from 'lucide-react'

interface Template {
  id: string
  name: string
  notificationType: string
  notificationChannel: string
  daysBeforeDuty: number | null
  emailMessage: string | null
  smsMessage: string | null
}

interface TypeOption {
  id: string
  label: string
  value: string
  sortOrder: number
}

interface ChannelOption {
  id: string
  label: string
  value: string
  sortOrder: number
}

interface Vehicle {
  id: string
  registration: string
  type: string
  organization: string
}

interface Organization {
  id: string
  name: string
}

interface NotificationBuilderProps {
  organization?: string
  duplicateData?: any
  onSuccess?: () => void
  onCancel?: () => void
}

export default function NotificationBuilder({
  organization: initialOrganization,
  duplicateData,
  onSuccess,
  onCancel,
}: NotificationBuilderProps) {
  const [step, setStep] = useState(0)
  const [organization, setOrganization] = useState(initialOrganization || '')
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [typeOptions, setTypeOptions] = useState<TypeOption[]>([])
  const [channelOptions, setChannelOptions] = useState<ChannelOption[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])

  const [formData, setFormData] = useState({
    templateId: '',
    vehicleId: '',
    notificationType: '',
    notificationChannel: '',
    dutyDate: '',
    notificationDate: '',
    personName: '',
    email: '',
    phoneNumber: '',
    company: organization,
    emailMessage: '',
  })

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (organization) {
      fetchTemplates()
      fetchTypeOptions()
      fetchChannelOptions()
      fetchVehicles()
      setFormData((prev) => ({ ...prev, company: organization }))
    }
  }, [organization])

  useEffect(() => {
    if (duplicateData) {
      const dupOrg = duplicateData.company || initialOrganization || ''
      setOrganization(dupOrg)
      setFormData({
        templateId: '',
        vehicleId: duplicateData.myVehicleId || '',
        notificationType: duplicateData.notificationType || '',
        notificationChannel: duplicateData.notificationChannel || '',
        dutyDate: duplicateData.dutyDate || '',
        notificationDate: duplicateData.notificationDate || '',
        personName: duplicateData.personName || '',
        email: duplicateData.email || '',
        phoneNumber: duplicateData.phoneNumber || '',
        company: dupOrg,
        emailMessage: duplicateData.emailMessage || '',
      })
      setStep(dupOrg ? 2 : 0)
    }
  }, [duplicateData, initialOrganization])

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`/api/notification-templates?organization=${organization}`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchTypeOptions = async () => {
    try {
      const response = await fetch(`/api/notification-type-options?organization=${organization}`)
      if (response.ok) {
        const data = await response.json()
        setTypeOptions(data.options || [])
      }
    } catch (error) {
      console.error('Failed to fetch type options:', error)
    }
  }

  const fetchChannelOptions = async () => {
    try {
      const response = await fetch(`/api/notification-channel-options?organization=${organization}`)
      if (response.ok) {
        const data = await response.json()
        setChannelOptions(data.options || [])
      }
    } catch (error) {
      console.error('Failed to fetch channel options:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`/api/my-vehicles?organization=${organization}`)
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.vehicles || [])
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }

  const fetchOrganizations = async () => {
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

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setFormData({
        ...formData,
        templateId,
        notificationType: template.notificationType,
        notificationChannel: template.notificationChannel,
        emailMessage: template.emailMessage || '',
      })
    } else {
      setFormData({
        ...formData,
        templateId: '',
      })
    }
  }

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (vehicle) {
      setFormData({
        ...formData,
        vehicleId,
        company: vehicle.organization,
      })
    }
  }

  const calculateNotificationDate = (dutyDate: string) => {
    if (!dutyDate) return ''

    const selectedTemplate = templates.find((t) => t.id === formData.templateId)
    if (selectedTemplate && selectedTemplate.daysBeforeDuty) {
      const duty = new Date(dutyDate)
      const notification = new Date(duty)
      notification.setDate(notification.getDate() - selectedTemplate.daysBeforeDuty)
      return notification.toISOString().split('T')[0]
    }

    return ''
  }

  const handleDutyDateChange = (dutyDate: string) => {
    const notificationDate = calculateNotificationDate(dutyDate)
    setFormData({
      ...formData,
      dutyDate,
      notificationDate: notificationDate || formData.notificationDate,
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/vehicle-notifications/create-from-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert('Notification created successfully!')
        if (onSuccess) onSuccess()
      } else {
        alert('Failed to create notification')
      }
    } catch (error) {
      console.error('Failed to create notification:', error)
      alert('Error creating notification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-xl">
            <Bell className="w-6 h-6 text-pictus-black" />
          </div>
          <div>
            <h2 className="text-3xl font-light text-pictus-white">
              {duplicateData ? 'Duplicate Notification' : 'Create New Notification'}
            </h2>
            <p className="text-gray-400 text-lg">
              {step === 0 ? 'Select Organization' : `Step ${step} of 3: ${step === 1 ? 'Select Template' : step === 2 ? 'Fill Details' : 'Review & Create'}`}
            </p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {organization && (
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-pictus-lime' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      )}

      {/* Step 0: Organization Selection */}
      {step === 0 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl p-6 border border-pictus-lime/30">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-pictus-lime" />
              <h3 className="text-2xl font-light text-pictus-white">Select Organization</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Select the organization for this notification from the available organizations.
            </p>
            <select
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg focus:outline-none focus:border-pictus-lime mb-4"
            >
              <option value="">Select an organization...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.name}>
                  {org.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (organization) {
                  setStep(1)
                } else {
                  alert('Please select an organization')
                }
              }}
              disabled={!organization}
              className="w-full px-6 py-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 disabled:opacity-50 disabled:cursor-not-allowed text-pictus-black text-lg rounded-lg transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Select Template */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl p-6 border border-pictus-lime/30">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-pictus-lime" />
              <h3 className="text-2xl font-light text-pictus-white">Choose a Template</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => {
                  handleTemplateSelect('')
                  setStep(2)
                }}
                className="p-6 bg-gradient-to-br from-gray-600/20 to-gray-800/20 rounded-xl border border-gray-500/30 hover:border-pictus-lime/50 transition-all text-left"
              >
                <Copy className="w-8 h-8 text-gray-400 mb-2" />
                <h4 className="text-xl font-light text-pictus-white mb-1">Create Custom</h4>
                <p className="text-gray-400 text-sm">Build from scratch with dropdowns</p>
              </button>

              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    handleTemplateSelect(template.id)
                    setStep(2)
                  }}
                  className="p-6 bg-gradient-to-br from-pictus-lime/20 to-pictus-lime600/20 rounded-xl border border-pictus-lime/30 hover:border-pictus-lime transition-all text-left"
                >
                  <Bell className="w-8 h-8 text-pictus-lime mb-2" />
                  <h4 className="text-xl font-light text-pictus-white mb-1">{template.name}</h4>
                  <p className="text-gray-400 text-sm">
                    {template.notificationType} • {template.notificationChannel}
                    {template.daysBeforeDuty && ` • ${template.daysBeforeDuty} days before`}
                  </p>
                </button>
              ))}
            </div>

            {/* Back button for Step 1 */}
            <button
              onClick={() => setStep(0)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
            >
              ← Back to Organization Selection
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Fill Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl p-6 border border-pictus-lime/30">
            <h3 className="text-2xl font-light text-pictus-white mb-4">Notification Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle Selection */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Car className="w-4 h-4 inline mr-1" />
                  Vehicle
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registration} - {vehicle.type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notification Type */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Bell className="w-4 h-4 inline mr-1" />
                  Notification Type
                </label>
                <select
                  value={formData.notificationType}
                  onChange={(e) => setFormData({ ...formData, notificationType: e.target.value })}
                  disabled={!!formData.templateId}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime disabled:opacity-50"
                >
                  <option value="">Select type...</option>
                  {typeOptions.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notification Channel */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Channel
                </label>
                <select
                  value={formData.notificationChannel}
                  onChange={(e) => setFormData({ ...formData, notificationChannel: e.target.value })}
                  disabled={!!formData.templateId}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime disabled:opacity-50"
                >
                  <option value="">Select channel...</option>
                  {channelOptions.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Duty Date */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Duty Date *
                </label>
                <input
                  type="date"
                  value={formData.dutyDate}
                  onChange={(e) => handleDutyDateChange(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                  required
                />
              </div>

              {/* Notification Date */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Notification Date
                </label>
                <input
                  type="date"
                  value={formData.notificationDate}
                  onChange={(e) => setFormData({ ...formData, notificationDate: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                />
              </div>

              {/* Person Name */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Person Name
                </label>
                <input
                  type="text"
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                  placeholder="Enter name..."
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                  placeholder="email@example.com"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                  placeholder="+421..."
                />
              </div>

              {/* Company (Read-only, set in Step 0) */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Organization
                </label>
                <input
                  type="text"
                  value={organization}
                  disabled
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                  placeholder="Organization..."
                />
                <p className="text-gray-500 text-xs mt-1">Selected in Step 0</p>
              </div>
            </div>

            {/* Email Message */}
            <div className="mt-4">
              <label className="block text-pictus-lime text-sm mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Message
              </label>
              <textarea
                value={formData.emailMessage}
                onChange={(e) => setFormData({ ...formData, emailMessage: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                placeholder="Enter email message..."
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.dutyDate}
                className="flex-1 px-6 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 disabled:opacity-50 disabled:cursor-not-allowed text-pictus-black rounded-lg transition-all"
              >
                Continue to Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Create */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl p-6 border border-pictus-lime/30">
            <h3 className="text-2xl font-light text-pictus-white mb-4">Review Notification</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Vehicle</p>
                <p className="text-white text-lg">
                  {vehicles.find((v) => v.id === formData.vehicleId)?.registration || 'Not selected'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Notification Type</p>
                <p className="text-white text-lg">{formData.notificationType || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Channel</p>
                <p className="text-white text-lg">{formData.notificationChannel || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Duty Date</p>
                <p className="text-white text-lg">{formData.dutyDate || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Notification Date</p>
                <p className="text-white text-lg">{formData.notificationDate || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Contact Person</p>
                <p className="text-white text-lg">{formData.personName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white text-lg">{formData.email || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white text-lg">{formData.phoneNumber || 'Not set'}</p>
              </div>
            </div>

            {formData.emailMessage && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Email Message</p>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white whitespace-pre-wrap">{formData.emailMessage}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 disabled:opacity-50 disabled:cursor-not-allowed text-pictus-black rounded-lg transition-all"
              >
                {loading ? (
                  'Creating...'
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
