'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { X, Save, Gift, Info } from 'lucide-react'
import { PHONE_PLACEHOLDER, isAcceptablePhone } from '@/lib/phone'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  organization: string | null
  active: boolean
  isFleetManager: boolean
  role: string
}

interface FleetManagerUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: User | null
  organization: string // This will be the organization name for display
  organizationId?: string // Optional: UUID of the organization
  canCreateBenefit?: boolean // Whether this org can create benefit users
  defaultBenefit?: boolean // Pre-check the benefit option when creating (e.g. from the garage)
}

// Match the CarCare modal conventions so the modal themes correctly in both dark and
// light (fs-light) mode — only these pictus-* / gray-* utilities are remapped for light.
const inputCls =
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none disabled:opacity-60'
const labelCls = 'block text-sm text-gray-400 mb-1.5'

export default function FleetManagerUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
  organization,
  organizationId,
  canCreateBenefit = false,
  defaultBenefit = false,
}: FleetManagerUserModalProps) {
  const t = useTranslations('Client')
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    active: true,
    isFleetManager: true,
    isBenefit: defaultBenefit,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        password: '',
        active: user.active ?? true,
        isFleetManager: user.isFleetManager || false,
        isBenefit: false,
      })
    } else {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: '',
        active: true,
        isFleetManager: true,
        isBenefit: defaultBenefit,
      })
    }
    setError('')
  }, [user, isOpen, defaultBenefit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.firstName || !formData.lastName) {
      setError(t('modalRequiredFields'))
      return
    }

    if (!isAcceptablePhone(formData.phoneNumber)) {
      setError(t('modalInvalidPhone'))
      return
    }

    setSaving(true)

    try {
      const url = user ? `/api/users/${user.id}` : '/api/users'
      const method = user ? 'PUT' : 'POST'

      const body: any = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || null,
        active: formData.active,
        isFleetManager: formData.isFleetManager,
        loginProvider: 'credentials',
        locale,
        ...(formData.isBenefit && { isBenefit: true }),
      }

      // Only include organization for new users
      if (!user) {
        // Send organizationId if available, otherwise fall back to organization name
        if (organizationId) {
          body.organizationId = organizationId
          body.organization = organizationId // Also set organization field for backward compatibility
        } else {
          body.organization = organization
        }
      }

      // Include password if provided
      if (formData.password && formData.password.trim() !== '') {
        body.password = formData.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save user')
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Failed to save user:', err)
      setError(err.message || t('modalSaveFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-pictus-onyx900 border border-white/[0.06] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-pictus-white">
            {user ? t('modalEditUser') : t('modalAddUser')}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>{t('modalOrganization')}</label>
            <input type="text" value={organization} disabled className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>
              {t('modalEmail')} <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>
              {t('modalFirstName')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>
              {t('modalLastName')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className={labelCls}>{t('modalPhone')}</label>
            <input
              type="tel"
              inputMode="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder={PHONE_PLACEHOLDER}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              {user ? t('modalPasswordEdit') : t('modalPasswordNew')}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={inputCls}
              placeholder={
                user ? t('modalPasswordEditPlaceholder') : t('modalPasswordNewPlaceholder')
              }
            />
          </div>

          {/* Benefit checkbox - only for orgs with canCreateBenefit and only when creating */}
          {canCreateBenefit && !user && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <Gift className="h-4 w-4 text-amber-400" />
                  {t('modalBenefitUser')}
                </label>
                <input
                  type="checkbox"
                  checked={formData.isBenefit}
                  onChange={(e) => setFormData({ ...formData, isBenefit: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-pictus-lime focus:ring-pictus-lime"
                />
              </div>
              {formData.isBenefit && (
                <div className="flex items-start gap-2 p-3 bg-pictus-lime/5 border border-pictus-lime/20 rounded-xl">
                  <Info className="h-4 w-4 text-pictus-lime mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-300">{t('modalBenefitInfo')}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-pictus-white rounded-full transition-all"
            >
              {t('modalCancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-pictus-lime hover:bg-pictus-lime600 disabled:opacity-50 text-pictus-black font-semibold rounded-full transition-all"
            >
              <Save className="h-4 w-4" />
              {saving ? t('modalSaving') : user ? t('modalSave') : t('modalCreate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
