'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react'

interface Template {
  id: string
  name: string
  notificationType: string
  notificationChannel: string
  daysBeforeDuty: number | null // Deprecated: use reminderIntervals
  reminderIntervals: number[] | null // Array of day offsets: e.g., [-30, -14, -7, 0, 1, 2]
  emailMessage: string | null
  smsMessage: string | null
}

interface TypeOption {
  id: string
  label: string
  sortOrder: number
}

interface ChannelOption {
  id: string
  label: string
  sortOrder: number
}

interface Vehicle {
  id: string
  registration: string
  type: string
  organizationId?: string
  organizationRelation?: {
    id: string
    name: string
  }
}

interface Organization {
  id: string
  name: string
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string | null
}

interface NotificationBuilderProps {
  organization?: string
  organizationTier?: string | null
  duplicateData?: any
  onSuccess?: () => void
  onCancel?: () => void
  hideChannelDropdown?: boolean
}

export default function NotificationBuilder({
  organization: initialOrganization,
  organizationTier,
  duplicateData,
  onSuccess,
  onCancel,
  hideChannelDropdown = false,
}: NotificationBuilderProps) {
  // If organization is provided, skip Step 0 (organization selection)
  const [step, setStep] = useState(initialOrganization ? 1 : 0)
  const [organization, setOrganization] = useState(initialOrganization || '')
  const [organizationId, setOrganizationId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [typeOptions, setTypeOptions] = useState<TypeOption[]>([])
  const [channelOptions, setChannelOptions] = useState<ChannelOption[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [usingDefaultTypeOptions, setUsingDefaultTypeOptions] = useState(false)
  const [usingDefaultChannelOptions, setUsingDefaultChannelOptions] = useState(false)
  const [notificationDaysOffset, setNotificationDaysOffset] = useState<number | ''>('')
  const [useCustomType, setUseCustomType] = useState(false)
  const [reminderIntervals, setReminderIntervals] = useState<number[]>([-30, -14, -3, 0])
  const [showIntervalsModal, setShowIntervalsModal] = useState(false)
  const [enablePdr, setEnablePdr] = useState(false)

  const [formData, setFormData] = useState({
    templateId: '',
    vehicleId: '',
    notificationType: '',
    notificationChannel: hideChannelDropdown ? 'Email/Sms' : '',
    dutyDate: '',
    notificationDate: '',
    personName: '',
    email: '',
    phoneNumber: '',
    organizationId: organizationId,
    emailMessage: '',
  })

  const fetchTemplates = useCallback(async () => {
    if (!organizationId) return
    try {
      // Try to fetch templates for the current organization
      const response = await fetch(`/api/notification-templates?organizationId=${organizationId}`)
      if (response.ok) {
        const data = await response.json()
        const templates = data.templates || []

        // If no templates found for current organization, check if DEFAULT org exists
        if (templates.length === 0) {
          const defaultOrg = organizations.find((org) => org.name === 'DEFAULT')
          if (defaultOrg) {
            const defaultResponse = await fetch(
              `/api/notification-templates?organizationId=${defaultOrg.id}`,
            )
            if (defaultResponse.ok) {
              const defaultData = await defaultResponse.json()
              setTemplates(defaultData.templates || [])
              return
            }
          }
        }

        setTemplates(templates)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }, [organizationId, organizations])

  const fetchTypeOptions = useCallback(async () => {
    if (!organizationId) return
    try {
      // Try to fetch options for the current organization
      console.log('[NotificationBuilder] Fetching type options for organizationId:', organizationId)
      const response = await fetch(
        `/api/notification-type-options?organizationId=${organizationId}`,
      )
      if (response.ok) {
        const data = await response.json()
        const options = data.options || []
        console.log('[NotificationBuilder] Received type options:', options.length, 'options')
        if (options.length > 0) {
          console.log(
            '[NotificationBuilder] First type option org:',
            options[0].organizationRelation?.name,
          )
        }

        // If no options found for current organization, fetch from DEFAULT
        if (options.length === 0) {
          console.log('[NotificationBuilder] No options found, trying DEFAULT org')
          const defaultOrg = organizations.find((org) => org.name === 'DEFAULT')
          if (defaultOrg) {
            const defaultResponse = await fetch(
              `/api/notification-type-options?organizationId=${defaultOrg.id}`,
            )
            if (defaultResponse.ok) {
              const defaultData = await defaultResponse.json()
              console.log(
                '[NotificationBuilder] Using DEFAULT org options:',
                defaultData.options?.length || 0,
              )
              setTypeOptions(defaultData.options || [])
              setUsingDefaultTypeOptions(true)
              return
            }
          }
        }

        setTypeOptions(options)
        setUsingDefaultTypeOptions(false)
      }
    } catch (error) {
      console.error('Failed to fetch type options:', error)
    }
  }, [organizationId, organizations])

  const fetchChannelOptions = useCallback(async () => {
    if (!organizationId) return
    try {
      // Try to fetch options for the current organization
      const response = await fetch(
        `/api/notification-channel-options?organizationId=${organizationId}`,
      )
      if (response.ok) {
        const data = await response.json()
        const options = data.options || []

        // If no options found for current organization, fetch from DEFAULT
        if (options.length === 0) {
          const defaultOrg = organizations.find((org) => org.name === 'DEFAULT')
          if (defaultOrg) {
            const defaultResponse = await fetch(
              `/api/notification-channel-options?organizationId=${defaultOrg.id}`,
            )
            if (defaultResponse.ok) {
              const defaultData = await defaultResponse.json()
              setChannelOptions(defaultData.options || [])
              setUsingDefaultChannelOptions(true)
              return
            }
          }
        }

        setChannelOptions(options)
        setUsingDefaultChannelOptions(false)
      }
    } catch (error) {
      console.error('Failed to fetch channel options:', error)
    }
  }, [organizationId, organizations])

  const fetchVehicles = useCallback(async () => {
    if (!organizationId) return
    try {
      console.log('[NotificationBuilder] Fetching vehicles for organizationId:', organizationId)
      const response = await fetch(`/api/my-vehicles?organizationId=${organizationId}`)
      if (response.ok) {
        const data = await response.json()
        console.log(
          '[NotificationBuilder] Received vehicles:',
          data.vehicles?.length || 0,
          'vehicles',
        )
        if (data.vehicles?.length > 0) {
          console.log(
            '[NotificationBuilder] First vehicle org:',
            data.vehicles[0].organizationRelation?.name,
          )
        }
        setVehicles(data.vehicles || [])
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    }
  }, [organizationId])

  const fetchUsers = useCallback(async () => {
    if (!organizationId) return
    try {
      const response = await fetch(`/api/users?organizationId=${organizationId}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }, [organizationId])

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

  // useEffect hooks
  useEffect(() => {
    fetchOrganizations()
  }, [])

  // Set organizationId when initialOrganization is provided or organizations load
  useEffect(() => {
    if (initialOrganization && organizations.length > 0 && !organizationId) {
      console.log('[NotificationBuilder] Looking up organization:', initialOrganization)
      console.log(
        '[NotificationBuilder] Available organizations:',
        organizations.map((o) => o.name),
      )
      const org = organizations.find((o) => o.name === initialOrganization)
      if (org) {
        console.log('[NotificationBuilder] Found organization:', org.name, 'ID:', org.id)
        setOrganizationId(org.id)
      } else {
        console.warn('[NotificationBuilder] Organization not found:', initialOrganization)
      }
    }
  }, [initialOrganization, organizations, organizationId])

  useEffect(() => {
    if (organizationId) {
      fetchTemplates()
      fetchTypeOptions()
      fetchChannelOptions()
      fetchVehicles()
      fetchUsers()
      setFormData((prev) => ({ ...prev, organizationId: organizationId }))
    }
  }, [
    organizationId,
    organization,
    fetchTemplates,
    fetchTypeOptions,
    fetchChannelOptions,
    fetchVehicles,
    fetchUsers,
  ])

  useEffect(() => {
    if (duplicateData) {
      // Get organization from duplicateData - prioritize organizationId, fallback to organization relation or company field
      let dupOrgId = duplicateData.organizationId
      let dupOrgName = ''

      if (!dupOrgId && duplicateData.organization) {
        dupOrgId = duplicateData.organization.id
        dupOrgName = duplicateData.organization.name
      }

      if (!dupOrgId && !dupOrgName) {
        dupOrgName = initialOrganization || ''
        const org = organizations.find((o) => o.name === dupOrgName)
        if (org) {
          dupOrgId = org.id
        }
      }

      if (dupOrgId) {
        setOrganizationId(dupOrgId)
        // Find organization name if we only have ID
        if (!dupOrgName) {
          const org = organizations.find((o) => o.id === dupOrgId)
          if (org) {
            dupOrgName = org.name
            setOrganization(dupOrgName)
          }
        } else {
          setOrganization(dupOrgName)
        }
      }

      // Format dates to YYYY-MM-DD for date inputs
      const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toISOString().split('T')[0]
      }

      setFormData({
        templateId: '',
        vehicleId: duplicateData.myVehicleId || '',
        notificationType: duplicateData.notificationType || '',
        notificationChannel: hideChannelDropdown
          ? 'Email/Sms'
          : duplicateData.notificationChannel || '',
        dutyDate: formatDate(duplicateData.dutyDate),
        notificationDate: formatDate(duplicateData.notificationDate),
        personName: duplicateData.personName || '',
        email: duplicateData.email || '',
        phoneNumber: duplicateData.phoneNumber || '',
        organizationId: dupOrgId || '',
        emailMessage: duplicateData.emailMessage || '',
      })
      setNotificationDaysOffset('') // Reset days offset when duplicating

      // Check if duplicated type exists in options, if not, use custom input
      if (duplicateData.notificationType && typeOptions.length > 0) {
        const typeExists = typeOptions.some((opt) => opt.label === duplicateData.notificationType)
        setUseCustomType(!typeExists)
      }

      setStep(dupOrgId ? 1 : 0) // Skip to Step 1 (template selection)
    }
  }, [duplicateData, initialOrganization, organizations, typeOptions, hideChannelDropdown])

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setFormData({
        ...formData,
        templateId,
        notificationType: template.notificationType,
        notificationChannel: hideChannelDropdown ? 'Email/Sms' : template.notificationChannel,
        emailMessage: template.emailMessage || '',
      })
      // Set reminder intervals from template
      if (template.reminderIntervals && Array.isArray(template.reminderIntervals)) {
        setReminderIntervals(template.reminderIntervals)
      } else if (template.daysBeforeDuty) {
        // Fallback to old daysBeforeDuty field (convert to negative for "before")
        setReminderIntervals([-template.daysBeforeDuty])
      }
      // Clear manual days offset when template is selected
      setNotificationDaysOffset('')
      // Reset custom type flag when template is selected
      setUseCustomType(false)
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
        organizationId: vehicle.organizationId || organizationId,
      })
    }
  }

  const handleUserSelect = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setFormData({
        ...formData,
        personName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        phoneNumber: user.phoneNumber || '',
      })
    }
  }

  const calculateNotificationDate = (dutyDate: string, daysOffset?: number | '') => {
    if (!dutyDate) return ''

    // Use manual days offset if provided
    if (daysOffset !== '' && daysOffset !== undefined) {
      const duty = new Date(dutyDate)
      const notification = new Date(duty)
      notification.setDate(notification.getDate() + daysOffset)
      return notification.toISOString().split('T')[0]
    }

    // Fall back to template days if available
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
    const notificationDate = calculateNotificationDate(dutyDate, notificationDaysOffset)
    setFormData({
      ...formData,
      dutyDate,
      notificationDate: notificationDate || formData.notificationDate,
    })
  }

  const handleDaysOffsetChange = (days: number | '') => {
    setNotificationDaysOffset(days)
    if (formData.dutyDate) {
      const notificationDate = calculateNotificationDate(formData.dutyDate, days)
      setFormData({
        ...formData,
        notificationDate: notificationDate || formData.notificationDate,
      })
    }
  }

  const handleSubmit = async () => {
    // Validation checks
    const errors: string[] = []

    // Check if notification type is provided
    if (!formData.notificationType || formData.notificationType.trim() === '') {
      errors.push('Typ notifikácie je povinný')
    }

    // Check if notification channel is provided
    if (!formData.notificationChannel || formData.notificationChannel.trim() === '') {
      errors.push('Kanál notifikácie je povinný')
    }

    // Check if duty date is provided
    if (!formData.dutyDate) {
      errors.push('Dátum úlohy je povinný')
    }

    // Check if intervals are provided
    if (reminderIntervals.length === 0) {
      errors.push('Musí byť zadaný aspoň jeden interval pripomienky')
    }

    // Check for past intervals (not today - today is allowed)
    if (formData.dutyDate && reminderIntervals.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day for comparison

      const pastIntervals: number[] = []
      reminderIntervals.forEach((offset) => {
        const dutyDate = new Date(formData.dutyDate)
        const notificationDate = new Date(dutyDate)
        notificationDate.setDate(notificationDate.getDate() + offset)
        notificationDate.setHours(0, 0, 0, 0)

        if (notificationDate < today) {
          pastIntervals.push(offset)
        }
      })

      if (pastIntervals.length > 0) {
        const futureCount = reminderIntervals.length - pastIntervals.length
        if (futureCount === 0) {
          errors.push(
            `Všetky intervaly vedú do minulosti: ${pastIntervals.join(', ')} dní. ` +
              'Nebudú vytvorené žiadne notifikácie. Zvoľte iný dátum úlohy.',
          )
        } else {
          // Just warn, don't block - these will be filtered out during creation
          console.log(
            `Preskakujem ${pastIntervals.length} intervalov v minulosti: ${pastIntervals.join(', ')}`,
          )
        }
      }
    }

    // Channel-specific validation
    const channel = formData.notificationChannel.toLowerCase()
    if (channel.includes('email') && channel.includes('sms')) {
      // Email/Sms channel requires both
      if (!formData.email || formData.email.trim() === '') {
        errors.push('Email je povinný pre kanál Email/Sms')
      }
      if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
        errors.push('Telefónne číslo je povinné pre kanál Email/Sms')
      }
    } else if (channel.includes('email')) {
      // Email channel requires email
      if (!formData.email || formData.email.trim() === '') {
        errors.push('Email je povinný pre kanál Email')
      }
    } else if (channel.includes('sms')) {
      // SMS channel requires phone
      if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
        errors.push('Telefónne číslo je povinné pre kanál SMS')
      }
    }

    // If there are validation errors, show them and stop
    if (errors.length > 0) {
      alert('Chyby validácie:\n\n' + errors.join('\n\n'))
      return
    }

    setLoading(true)
    try {
      // Always use reminderIntervals to create notifications (even if just one)
      if (formData.dutyDate && reminderIntervals.length > 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Filter out past intervals (but allow today)
        const validIntervals = reminderIntervals.filter((offset) => {
          const dutyDate = new Date(formData.dutyDate)
          const notificationDate = new Date(dutyDate)
          notificationDate.setDate(notificationDate.getDate() + offset)
          notificationDate.setHours(0, 0, 0, 0)
          return notificationDate >= today
        })

        // Generate a batch ID if there are multiple valid intervals OR if PDR is enabled
        const dutyBatchId =
          validIntervals.length > 1 || enablePdr
            ? `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
            : null

        console.log('[NotificationBuilder] Creating notifications with formData:', formData)
        console.log('[NotificationBuilder] Valid intervals:', validIntervals)
        console.log('[NotificationBuilder] Batch ID:', dutyBatchId)
        console.log('[NotificationBuilder] PDR enabled:', enablePdr)

        const promises = validIntervals.map((offset) => {
          const dutyDate = new Date(formData.dutyDate)
          const notificationDate = new Date(dutyDate)
          notificationDate.setDate(notificationDate.getDate() + offset)

          const payload = {
            ...formData,
            notificationDate: notificationDate.toISOString().split('T')[0],
            dutyBatchId, // Include batch ID in payload
          }

          console.log('[NotificationBuilder] Creating notification with payload:', payload)
          console.log('[NotificationBuilder] Payload vehicleId:', payload.vehicleId)

          return fetch('/api/vehicle-notifications/create-from-template', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })
        })

        const responses = await Promise.all(promises)

        // Check for limit errors (403)
        const limitError = responses.find((r) => r.status === 403)
        if (limitError) {
          const errorData = await limitError.json().catch(() => null)
          alert(errorData?.error || 'Dosiahli ste limit notifikácií. Kontaktujte administrátora.')
          return
        }

        const allSuccessful = responses.every((r) => r.ok)

        if (allSuccessful) {
          const count = validIntervals.length
          const skipped = reminderIntervals.length - validIntervals.length

          // If PDR is enabled, create PDR reminder notification
          if (enablePdr && dutyBatchId) {
            try {
              const pdrReminderDate = new Date(formData.dutyDate)
              pdrReminderDate.setDate(pdrReminderDate.getDate() + 1) // 1 day after duty

              const vehicleReg =
                vehicles.find((v) => v.id === formData.vehicleId)?.registration ||
                formData.vehicleId
              const pdrMessage = `${formData.notificationType} pre ${vehicleReg} bola včera. Naplánujete ďalšiu?`

              const pdrPayload = {
                ...formData,
                notificationDate: pdrReminderDate.toISOString().split('T')[0],
                dutyBatchId: null, // PDR reminder doesn't belong to a batch
                isPdr: true,
                pdrReminderFor: dutyBatchId,
                emailMessage: pdrMessage,
              }

              console.log('Creating PDR reminder with payload:', pdrPayload)

              const pdrResponse = await fetch('/api/vehicle-notifications/create-from-template', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(pdrPayload),
              })

              if (pdrResponse.ok) {
                console.log('PDR reminder created successfully')
              } else {
                console.error('Failed to create PDR reminder')
              }
            } catch (pdrError) {
              console.error('Error creating PDR reminder:', pdrError)
            }
          }

          let message =
            count === 1
              ? 'Notifikácia bola úspešne vytvorená!'
              : `${count} notifikácií bolo úspešne vytvorených!`

          if (enablePdr) {
            message += '\n\n🔄 PDR pripomienka bola tiež vytvorená pre deň po úlohe.'
          }

          if (skipped > 0) {
            message += `\n\n${skipped} interval${skipped === 1 ? '' : 'ov'} v minulosti bol${skipped === 1 ? '' : 'o'} preskočených.`
          }

          alert(message)
          if (onSuccess) onSuccess()
        } else {
          alert('Niektoré notifikácie sa nepodarilo vytvoriť')
        }
      }
    } catch (error) {
      console.error('Failed to create notification:', error)
      alert('Chyba pri vytváraní notifikácie')
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
              {duplicateData ? 'Duplikovať notifikáciu' : 'Vytvoriť novú notifikáciu'}
            </h2>
            <p className="text-gray-400 text-lg">
              {step === 0
                ? 'Vybrať organizáciu'
                : `Krok ${step} z 3: ${step === 1 ? 'Vybrať šablónu' : step === 2 ? 'Vyplniť detaily' : 'Skontrolovať a vytvoriť'}`}
            </p>
          </div>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
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
              <h3 className="text-2xl font-light text-pictus-white">Vybrať organizáciu</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Vyberte organizáciu pre túto notifikáciu z dostupných organizácií.
            </p>
            <select
              value={organization}
              onChange={(e) => {
                const orgName = e.target.value
                const org = organizations.find((o) => o.name === orgName)
                setOrganization(orgName)
                setOrganizationId(org?.id || '')
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-lg focus:outline-none focus:border-pictus-lime mb-4"
            >
              <option value="">Vyberte organizáciu...</option>
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
                  alert('Prosím vyberte organizáciu')
                }
              }}
              disabled={!organization}
              className="w-full px-6 py-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 disabled:opacity-50 disabled:cursor-not-allowed text-pictus-black text-lg rounded-lg transition-all"
            >
              Pokračovať
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
              <h3 className="text-2xl font-light text-pictus-white">Vybrať šablónu</h3>
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
                <h4 className="text-xl font-light text-pictus-white mb-1">Vlastná notifikácia</h4>
                <p className="text-gray-400 text-sm">
                  Vytvorte od začiatku pomocou rozbaľovacích ponúk
                </p>
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
                    {template.daysBeforeDuty && ` • ${template.daysBeforeDuty} dní pred`}
                  </p>
                </button>
              ))}
            </div>

            {/* Back button for Step 1 - only show if no initial organization */}
            {!initialOrganization && (
              <button
                onClick={() => setStep(0)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                ← Späť na výber organizácie
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Fill Details */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl p-6 border border-pictus-lime/30">
            <h3 className="text-2xl font-light text-pictus-white mb-4">Detaily notifikácie</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle Selection */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Car className="w-4 h-4 inline mr-1" />
                  Vozidlo
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => handleVehicleSelect(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                >
                  <option value="">Vybrať vozidlo...</option>
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
                  Typ notifikácie
                </label>
                {!useCustomType ? (
                  <>
                    <select
                      value={formData.notificationType}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setUseCustomType(true)
                          setFormData({ ...formData, notificationType: '' })
                        } else {
                          setFormData({ ...formData, notificationType: e.target.value })
                        }
                      }}
                      disabled={
                        !!formData.templateId &&
                        !!templates.find((t) => t.id === formData.templateId)?.notificationType
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime disabled:opacity-50"
                    >
                      <option value="">Vybrať typ...</option>
                      {typeOptions.map((option) => (
                        <option key={option.id} value={option.label}>
                          {option.label}
                        </option>
                      ))}
                      {(organizationTier === 'BUSINESS' || organizationTier === undefined) && (
                        <option value="__CUSTOM__">✏️ Vlastný (zadajte svoj)...</option>
                      )}
                    </select>
                    {usingDefaultTypeOptions && (
                      <p className="text-yellow-400 text-xs mt-1">
                        Používajú sa predvolené možnosti (nie sú nakonfigurované možnosti pre{' '}
                        {organization})
                      </p>
                    )}
                    {organizationTier && organizationTier !== 'BUSINESS' && (
                      <p className="text-blue-400 text-xs mt-1">
                        ℹ️ Vlastné typy notifikácií sú dostupné iba pre Business tier
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.notificationType}
                      onChange={(e) =>
                        setFormData({ ...formData, notificationType: e.target.value })
                      }
                      disabled={
                        !!formData.templateId &&
                        !!templates.find((t) => t.id === formData.templateId)?.notificationType
                      }
                      placeholder="Zadajte vlastný typ notifikácie..."
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomType(false)
                        setFormData({ ...formData, notificationType: '' })
                      }}
                      className="text-xs text-gray-400 hover:text-pictus-lime transition-colors"
                    >
                      ← Späť na rozbaľovaciu ponuku
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Channel */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Kanál
                </label>
                {hideChannelDropdown ? (
                  <input
                    type="text"
                    value="Email/Sms"
                    disabled
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                ) : (
                  <>
                    <select
                      value={formData.notificationChannel}
                      onChange={(e) =>
                        setFormData({ ...formData, notificationChannel: e.target.value })
                      }
                      disabled={
                        !!formData.templateId &&
                        !!templates.find((t) => t.id === formData.templateId)?.notificationChannel
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime disabled:opacity-50"
                    >
                      <option value="">Vybrať kanál...</option>
                      {channelOptions.map((option) => (
                        <option key={option.id} value={option.label}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {usingDefaultChannelOptions && (
                      <p className="text-yellow-400 text-xs mt-1">
                        Používajú sa predvolené možnosti (nie sú nakonfigurované možnosti pre{' '}
                        {organization})
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Post-Duty Renewal (PDR) Toggle */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <input
                    type="checkbox"
                    id="enablePdr"
                    checked={enablePdr}
                    onChange={(e) => setEnablePdr(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-pictus-lime focus:ring-pictus-lime focus:ring-offset-gray-900"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="enablePdr"
                      className="text-white font-light text-base cursor-pointer"
                    >
                      🔄 Post-Duty Renewal (PDR)
                    </label>
                    <p className="text-blue-300 text-sm mt-1">
                      Automaticky vytvorí pripomienku deň po termíne úlohy pre plánovanie ďalšej
                      úlohy
                    </p>
                  </div>
                </div>
              </div>

              {/* Duty Date */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Dátum úlohy *
                </label>
                <input
                  type="date"
                  value={formData.dutyDate}
                  onChange={(e) => handleDutyDateChange(e.target.value)}
                  className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white focus:outline-none focus:border-pictus-lime ${
                    !formData.dutyDate ? 'border-red-500/50' : 'border-white/10'
                  }`}
                  required
                />
                {!formData.dutyDate && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Dátum úlohy je povinný pre vytvorenie notifikácie
                  </p>
                )}
              </div>

              {/* Reminder Intervals */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-pictus-lime text-sm">
                    <Bell className="w-4 h-4 inline mr-1" />
                    Intervaly pripomienok
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowIntervalsModal(true)}
                    className="text-xs text-pictus-lime hover:text-pictus-lime400 transition-colors"
                  >
                    ✏️ Upraviť intervaly
                  </button>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <p className="text-gray-400 text-base mb-3">
                    Vytvorí sa {reminderIntervals.length}{' '}
                    {reminderIntervals.length === 1
                      ? 'notifikácia'
                      : reminderIntervals.length < 5
                        ? 'notifikácie'
                        : 'notifikácií'}
                    :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {reminderIntervals
                      .sort((a, b) => a - b)
                      .map((interval, index) => {
                        if (!formData.dutyDate) {
                          return (
                            <div
                              key={index}
                              className="px-3 py-2 bg-pictus-lime/20 border border-pictus-lime/30 rounded-lg text-pictus-lime text-sm"
                            >
                              {interval === 0
                                ? 'V deň úlohy'
                                : interval > 0
                                  ? `+${interval} dní`
                                  : `${interval} dní`}
                            </div>
                          )
                        }

                        const dutyDate = new Date(formData.dutyDate)
                        const notifDate = new Date(dutyDate)
                        notifDate.setDate(notifDate.getDate() + interval)

                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const notifDateNoTime = new Date(notifDate)
                        notifDateNoTime.setHours(0, 0, 0, 0)
                        const isPast = notifDateNoTime < today

                        const dateStr = notifDate.toLocaleDateString('sk-SK', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })

                        return (
                          <div
                            key={index}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              isPast
                                ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                                : 'bg-pictus-lime/20 border border-pictus-lime/30 text-pictus-lime'
                            }`}
                          >
                            <div className="font-medium">
                              {isPast && '⚠️ '}
                              {dateStr}
                            </div>
                            <div
                              className={`text-xs ${isPast ? 'text-red-400/70' : 'text-pictus-lime/70'}`}
                            >
                              {interval === 0
                                ? 'V deň úlohy'
                                : interval > 0
                                  ? `+${interval} dní`
                                  : `${interval} dní`}
                              {isPast && ' (minulosť)'}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                  <p className="text-gray-400 text-base mt-3">
                    {reminderIntervals.length === 1
                      ? 'Pre jednorázovú notifikáciu nastavte len jeden interval.'
                      : 'Upravte intervaly alebo pridajte vlastné dni pred/po dátume úlohy.'}
                  </p>
                </div>
              </div>

              {!hideChannelDropdown && <input type="hidden" value={notificationDaysOffset} />}

              {/* User Selection (auto-fills name, email, and phone) */}
              <div className="md:col-span-2">
                <label className="block text-pictus-lime text-sm mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Vybrať používateľa (voliteľné - vyplní meno, email a telefón)
                </label>
                <select
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                >
                  <option value="">Vyberte používateľa alebo zadajte manuálne...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {`${user.firstName || ''} ${user.lastName || ''}`.trim()} - {user.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Person Name */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Meno osoby (alebo vyberte používateľa)
                </label>
                <input
                  type="text"
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                  placeholder="Zadajte meno manuálne..."
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                  {(() => {
                    const channel = formData.notificationChannel.toLowerCase()
                    const isRequired = channel.includes('email')
                    return isRequired ? (
                      <span className="text-red-400 ml-1">*</span>
                    ) : (
                      ' (alebo vyberte používateľa)'
                    )
                  })()}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                  placeholder="Zadajte email manuálne..."
                />
                {(() => {
                  const channel = formData.notificationChannel.toLowerCase()
                  const isRequired = channel.includes('email')
                  if (isRequired && (!formData.email || formData.email.trim() === '')) {
                    return (
                      <p className="text-red-400 text-xs mt-1">
                        ⚠️ Email je povinný pre zvolený kanál
                      </p>
                    )
                  }
                  return null
                })()}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Telefónne číslo
                  {(() => {
                    const channel = formData.notificationChannel.toLowerCase()
                    const isRequired = channel.includes('sms')
                    return isRequired ? (
                      <span className="text-red-400 ml-1">*</span>
                    ) : (
                      ' (alebo vyberte používateľa)'
                    )
                  })()}
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                  placeholder="Zadajte telefón manuálne..."
                />
                {(() => {
                  const channel = formData.notificationChannel.toLowerCase()
                  const isRequired = channel.includes('sms')
                  if (isRequired && (!formData.phoneNumber || formData.phoneNumber.trim() === '')) {
                    return (
                      <p className="text-red-400 text-xs mt-1">
                        ⚠️ Telefónne číslo je povinné pre zvolený kanál
                      </p>
                    )
                  }
                  return null
                })()}
              </div>

              {/* Company (Read-only, set in Step 0) */}
              <div>
                <label className="block text-pictus-lime text-sm mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Organizácia
                </label>
                <input
                  type="text"
                  value={organization}
                  disabled
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                  placeholder="Organizácia..."
                />
                <p className="text-gray-500 text-xs mt-1">Vybrané v kroku 0</p>
              </div>
            </div>

            {/* Email Message */}
            <div className="mt-4">
              <label className="block text-pictus-lime text-sm mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Správa{' '}
                <span>... už obsahuje ŠPZ, úlohu a dátum. Zadajte oslovenie alebo pozdrav.</span>
              </label>
              <textarea
                value={formData.emailMessage}
                onChange={(e) => setFormData({ ...formData, emailMessage: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                placeholder="Správa už obsahuje ŠPZ, úlohu a dátum."
              />
            </div>

            {/* Validation Summary */}
            {!formData.dutyDate && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Vyžadované pole chýba
                </p>
                <ul className="text-red-300 text-sm space-y-1 list-disc list-inside">
                  {!formData.dutyDate && <li>Prosím vyberte dátum úlohy pre pokračovanie</li>}
                </ul>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Späť
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.dutyDate}
                className="flex-1 px-6 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 disabled:opacity-50 disabled:cursor-not-allowed text-pictus-black rounded-lg transition-all"
                title={!formData.dutyDate ? 'Dátum úlohy je povinný' : ''}
              >
                Pokračovať na kontrolu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Create */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl p-6 border border-pictus-lime/30">
            <h3 className="text-2xl font-light text-pictus-white mb-4">Skontrolovať notifikáciu</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Vozidlo</p>
                <p className="text-white text-lg">
                  {vehicles.find((v) => v.id === formData.vehicleId)?.registration || 'Nevybrané'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Typ notifikácie</p>
                <p className="text-white text-lg">{formData.notificationType || 'Nenastavené'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Kanál</p>
                <p className="text-white text-lg">
                  {formData.notificationChannel || 'Nenastavené'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Dátum úlohy</p>
                <p className="text-white text-lg">{formData.dutyDate || 'Nenastavené'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-400 text-sm">Post-Duty Renewal (PDR)</p>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-base ${
                    enablePdr
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}
                >
                  {enablePdr ? '🔄 Zapnuté' : 'Vypnuté'}
                </div>
                {enablePdr && (
                  <p className="text-blue-300 text-sm mt-2">
                    Bude vytvorená pripomienka deň po termíne úlohy na zadanie nového termínu.
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <p className="text-gray-400 text-sm mb-2">Dátumy notifikácií</p>
                <div className="text-white text-lg">
                  {formData.dutyDate && reminderIntervals.length > 0 ? (
                    <div className="space-y-1">
                      {reminderIntervals
                        .sort((a, b) => a - b)
                        .map((interval, index) => {
                          const dutyDate = new Date(formData.dutyDate)
                          const notifDate = new Date(dutyDate)
                          notifDate.setDate(notifDate.getDate() + interval)

                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const notifDateNoTime = new Date(notifDate)
                          notifDateNoTime.setHours(0, 0, 0, 0)
                          const isPast = notifDateNoTime < today

                          const dateStr = notifDate.toLocaleDateString('sk-SK', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                          return (
                            <div
                              key={index}
                              className={`text-sm px-3 py-2 rounded-lg ${isPast ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-pictus-lime/10 text-pictus-lime'}`}
                            >
                              {isPast && '⚠️ '}
                              {dateStr} (
                              {interval === 0
                                ? 'v deň úlohy'
                                : interval > 0
                                  ? `+${interval} dní`
                                  : `${interval} dní`}
                              ){isPast && ' - Dátum je v minulosti!'}
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    'Nenastavené'
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Kontaktná osoba</p>
                <p className="text-white text-lg">{formData.personName || 'Nenastavené'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white text-lg">{formData.email || 'Nenastavené'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Telefón</p>
                <p className="text-white text-lg">{formData.phoneNumber || 'Nenastavené'}</p>
              </div>
            </div>

            {formData.emailMessage && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Emailová správa</p>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-white whitespace-pre-wrap">{formData.emailMessage}</p>
                </div>
              </div>
            )}

            {/* Validation Warnings */}
            {(() => {
              const warnings: string[] = []
              const channel = formData.notificationChannel.toLowerCase()

              // Check channel-specific requirements
              if (channel.includes('email') && channel.includes('sms')) {
                if (!formData.email || formData.email.trim() === '') {
                  warnings.push('Email je povinný pre kanál Email/Sms')
                }
                if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
                  warnings.push('Telefónne číslo je povinné pre kanál Email/Sms')
                }
              } else if (channel.includes('email')) {
                if (!formData.email || formData.email.trim() === '') {
                  warnings.push('Email je povinný pre kanál Email')
                }
              } else if (channel.includes('sms')) {
                if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
                  warnings.push('Telefónne číslo je povinné pre kanál SMS')
                }
              }

              // Check for past intervals
              if (formData.dutyDate && reminderIntervals.length > 0) {
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                const pastCount = reminderIntervals.filter((offset) => {
                  const dutyDate = new Date(formData.dutyDate)
                  const notificationDate = new Date(dutyDate)
                  notificationDate.setDate(notificationDate.getDate() + offset)
                  notificationDate.setHours(0, 0, 0, 0)
                  return notificationDate < today
                }).length

                if (pastCount > 0) {
                  warnings.push(
                    `${pastCount} ${pastCount === 1 ? 'interval vedie' : 'intervaly vedú'} do minulosti`,
                  )
                }
              }

              if (warnings.length > 0) {
                return (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 font-medium mb-2">⚠️ Upozornenia:</p>
                    <ul className="text-red-300 text-sm space-y-1 list-disc list-inside">
                      {warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )
              }
              return null
            })()}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Späť
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 disabled:opacity-50 disabled:cursor-not-allowed text-pictus-black rounded-lg transition-all"
              >
                {loading ? (
                  'Vytváram...'
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Vytvoriť notifikáciu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intervals Modal */}
      {showIntervalsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-pictus-onyx900 border border-pictus-lime/30 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-light text-white">Upraviť intervaly</h3>
              <button
                onClick={() => setShowIntervalsModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-400 text-sm">
                Nastavte dni pred/po dátume úlohy kedy sa majú odoslať notifikácie.
              </p>

              {reminderIntervals.map((interval, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={interval}
                    onChange={(e) => {
                      const newIntervals = [...reminderIntervals]
                      newIntervals[index] = parseInt(e.target.value)
                      setReminderIntervals(newIntervals)
                    }}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pictus-lime"
                  >
                    {Array.from({ length: 33 }, (_, i) => -30 + i).map((day) => (
                      <option key={day} value={day}>
                        {day === 0
                          ? 'V deň úlohy'
                          : day < 0
                            ? `${Math.abs(day)} ${Math.abs(day) === 1 ? 'deň' : Math.abs(day) < 5 ? 'dni' : 'dní'} pred`
                            : `${day} ${day === 1 ? 'deň' : day < 5 ? 'dni' : 'dní'} po`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setReminderIntervals(reminderIntervals.filter((_, i) => i !== index))
                    }}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    disabled={reminderIntervals.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  // Add a new interval (default to -7 days)
                  setReminderIntervals([...reminderIntervals, -7])
                }}
                className="w-full px-4 py-2 bg-pictus-lime/20 hover:bg-pictus-lime/30 text-pictus-lime border border-pictus-lime/30 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Pridať interval
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowIntervalsModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Zrušiť
              </button>
              <button
                type="button"
                onClick={() => setShowIntervalsModal(false)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 hover:from-pictus-lime400 hover:to-pictus-lime700 text-pictus-black rounded-lg transition-all"
              >
                Hotovo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
