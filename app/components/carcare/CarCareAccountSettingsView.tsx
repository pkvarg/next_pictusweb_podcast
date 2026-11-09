'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { Loader2, Save, CheckCircle, AlertCircle, User as UserIcon, Building2 } from 'lucide-react'

interface AccountData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}
interface OrgData {
  name: string
  mainContact: string
  ico: string
  dic: string
  street: string
  city: string
  postalCode: string
  country: string
}

const emptyAccount: AccountData = { firstName: '', lastName: '', email: '', phoneNumber: '' }
const emptyOrg: OrgData = {
  name: '',
  mainContact: '',
  ico: '',
  dic: '',
  street: '',
  city: '',
  postalCode: '',
  country: '',
}

const inputClass =
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none disabled:opacity-60'
const labelClass = 'block text-sm text-gray-400 mb-1.5'
const card = 'bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5'

export default function CarCareAccountSettingsView() {
  const t = useTranslations('FleetSyncOnboarding')
  const { status } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [account, setAccount] = useState<AccountData>(emptyAccount)
  const [org, setOrg] = useState<OrgData>(emptyOrg)
  const [canEditOrg, setCanEditOrg] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/auth/login')
  }, [status, router])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/client/settings')
      if (!res.ok) throw new Error('load failed')
      const data = await res.json()
      const a = (data.account || {}) as Partial<AccountData>
      const o = (data.organization || {}) as Partial<OrgData>
      setAccount({
        firstName: a.firstName ?? '',
        lastName: a.lastName ?? '',
        email: a.email ?? '',
        phoneNumber: a.phoneNumber ?? '',
      })
      setOrg({
        name: o.name ?? '',
        mainContact: o.mainContact ?? '',
        ico: o.ico ?? '',
        dic: o.dic ?? '',
        street: o.street ?? '',
        city: o.city ?? '',
        postalCode: o.postalCode ?? '',
        country: o.country ?? '',
      })
      setCanEditOrg(Boolean(data.canEditOrg))
    } catch {
      setError(t('settingsLoadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (status === 'authenticated') load()
  }, [status, load])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await fetch('/api/client/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: {
            firstName: account.firstName,
            lastName: account.lastName,
            phoneNumber: account.phoneNumber,
          },
          organization: org,
        }),
      })
      if (!res.ok) throw new Error('save failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch {
      setError(t('settingsSaveError'))
    } finally {
      setSaving(false)
    }
  }

  const setOrgField = (f: keyof OrgData, v: string) => setOrg((prev) => ({ ...prev, [f]: v }))
  const setAccField = (f: keyof AccountData, v: string) =>
    setAccount((prev) => ({ ...prev, [f]: v }))

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-pictus-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pictus-lime animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-5">
        <header>
          <h1 className="text-3xl font-light">{t('settingsTitle')}</h1>
        </header>

        <section className={card}>
          <h2 className="font-medium mb-4 inline-flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-pictus-lime" />
            {t('settingsAccount')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t('firstName')}</label>
              <input
                className={inputClass}
                value={account.firstName}
                onChange={(e) => setAccField('firstName', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('lastName')}</label>
              <input
                className={inputClass}
                value={account.lastName}
                onChange={(e) => setAccField('lastName', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('phoneNumber')}</label>
              <input
                className={inputClass}
                value={account.phoneNumber}
                onChange={(e) => setAccField('phoneNumber', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('email')}</label>
              <input
                className={`${inputClass} cursor-not-allowed`}
                value={account.email}
                readOnly
              />
            </div>
          </div>
        </section>

        <section className={card}>
          <h2 className="font-medium mb-2 inline-flex items-center gap-2">
            <Building2 className="w-4 h-4 text-pictus-lime" />
            {t('settingsOrg')}
          </h2>
          {!canEditOrg && (
            <p className="text-sm text-amber-300/80 mb-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {t('settingsOrgLocked')}
            </p>
          )}
          <fieldset
            disabled={!canEditOrg}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0 disabled:opacity-60"
          >
            <div className="sm:col-span-2">
              <label className={labelClass}>{t('orgName')}</label>
              <input
                className={inputClass}
                value={org.name}
                onChange={(e) => setOrgField('name', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('ico')}</label>
              <input
                className={inputClass}
                value={org.ico}
                onChange={(e) => setOrgField('ico', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('dic')}</label>
              <input
                className={inputClass}
                value={org.dic}
                onChange={(e) => setOrgField('dic', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>{t('street')}</label>
              <input
                className={inputClass}
                value={org.street}
                onChange={(e) => setOrgField('street', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('postalCode')}</label>
              <input
                className={inputClass}
                value={org.postalCode}
                onChange={(e) => setOrgField('postalCode', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('city')}</label>
              <input
                className={inputClass}
                value={org.city}
                onChange={(e) => setOrgField('city', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('country')}</label>
              <input
                className={inputClass}
                value={org.country}
                onChange={(e) => setOrgField('country', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('orgContact')}</label>
              <input
                className={inputClass}
                value={org.mainContact}
                onChange={(e) => setOrgField('mainContact', e.target.value)}
              />
            </div>
          </fieldset>
        </section>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 bg-pictus-lime/10 border border-pictus-lime/30 text-pictus-lime px-4 py-3 rounded-xl">
            <CheckCircle className="w-5 h-5 shrink-0" />
            {t('settingsSaved')}
          </div>
        )}

        <div className="flex justify-stretch sm:justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-pictus-lime text-pictus-black font-semibold px-6 py-3 rounded-xl hover:bg-pictus-lime600 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? t('settingsSaving') : t('settingsSave')}
          </button>
        </div>
      </div>
    </div>
  )
}
