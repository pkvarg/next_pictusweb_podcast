'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import { ArrowLeft, Loader2, Save, CheckCircle, AlertCircle } from 'lucide-react'

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
  'w-full px-4 py-3 bg-pictus-white/5 border border-pictus-white/10 rounded-lg text-pictus-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pictus-lime focus:border-transparent transition-all'
const labelClass = 'block text-pictus-lime text-sm mb-2 font-light'

export default function ClientSettingsPage() {
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
      setAccount({ ...emptyAccount, ...(data.account || {}) })
      setOrg({ ...emptyOrg, ...(data.organization || {}) })
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-pictus-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pictus-lime animate-spin" />
      </div>
    )
  }

  const setOrgField = (f: keyof OrgData, v: string) => setOrg((prev) => ({ ...prev, [f]: v }))
  const setAccField = (f: keyof AccountData, v: string) =>
    setAccount((prev) => ({ ...prev, [f]: v }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-pictus-black via-pictus-onyx900 to-pictus-black text-pictus-white font-brutal-milk">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/client"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-pictus-lime mb-8 transition-colors font-light"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('settingsBack')}
        </Link>

        <h1 className="text-3xl font-light mb-8 text-pictus-white">{t('settingsTitle')}</h1>

        {/* Account */}
        <section className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 backdrop-blur-sm rounded-2xl p-6 border border-pictus-lime/20 mb-6">
          <h2 className="text-xl font-light mb-5 text-pictus-white">{t('settingsAccount')}</h2>
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
                className={`${inputClass} opacity-60 cursor-not-allowed`}
                value={account.email}
                readOnly
              />
            </div>
          </div>
        </section>

        {/* Organization / billing */}
        <section className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 backdrop-blur-sm rounded-2xl p-6 border border-pictus-lime/20">
          <h2 className="text-xl font-light mb-2 text-pictus-white">{t('settingsOrg')}</h2>
          {!canEditOrg && (
            <p className="text-sm text-amber-300/80 mb-5 flex items-start gap-2">
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
          <div className="mt-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg font-light">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}
        {saved && (
          <div className="mt-6 flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg font-light">
            <CheckCircle className="w-5 h-5 shrink-0" />
            {t('settingsSaved')}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? t('settingsSaving') : t('settingsSave')}
          </button>
        </div>
      </div>
    </div>
  )
}
