'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import {
  Users,
  UserPlus,
  X,
  Copy,
  Check,
  Loader2,
  Shield,
  Mail,
  Car,
  ChevronDown,
  ChevronRight,
  Wrench,
  Phone,
  ExternalLink,
  MapPin,
  Plus,
} from 'lucide-react'

export interface GarageMember {
  userId: string
  role: 'OWNER' | 'MEMBER' | 'VIEWER'
  name: string | null
  email: string | null
  isYou: boolean
  implicit: boolean
  vehicleIds: string[]
}

export interface GarageVehicle {
  id: string
  name: string
  registration: string
}

export interface GarageProvider {
  id: string
  name: string
  category: string | null
  phone: string | null
  email: string | null
  bookingUrl: string | null
  address: string | null
}

export interface GarageInvitationItem {
  id: string
  email: string
  role: 'OWNER' | 'MEMBER' | 'VIEWER'
  token: string
  expiresAt: string
}

export interface GarageData {
  role: 'OWNER' | 'MEMBER' | 'VIEWER' | 'ADMIN'
  canManage: boolean
  currentUserId: string
  members: GarageMember[]
  invitations: GarageInvitationItem[]
  vehicles: GarageVehicle[]
}

function memberLabel(
  m: GarageMember,
  t: (k: string, v?: Record<string, string | number>) => string,
) {
  return m.name || m.email || t('garage.memberFallback')
}
function initials(m: GarageMember) {
  const s = m.name || m.email || '?'
  return s
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
function inviteUrl(token: string) {
  if (typeof window === 'undefined') return ''
  const base = window.location.pathname.split('/client/my-fleet')[0]
  return `${window.location.origin}${base}/client/my-fleet/invite/${token}`
}

export default function CarCareGarageView({
  data,
  reload,
}: {
  data: GarageData
  reload: () => void
}) {
  const t = useTranslations('CarCare')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'MEMBER' | 'VIEWER'>('MEMBER')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [accessBusy, setAccessBusy] = useState<string | null>(null)

  const [providers, setProviders] = useState<GarageProvider[]>([])
  const [provForm, setProvForm] = useState(false)
  const [provName, setProvName] = useState('')
  const [provPhone, setProvPhone] = useState('')
  const [provEmail, setProvEmail] = useState('')
  const [provBooking, setProvBooking] = useState('')
  const [provAddress, setProvAddress] = useState('')
  const [provBusy, setProvBusy] = useState(false)

  const loadProviders = () => {
    fetch('/api/carcare/providers')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setProviders(d.providers ?? []))
      .catch(() => setProviders([]))
  }
  useEffect(loadProviders, [])

  const [garages, setGarages] = useState<{ organizationId: string; name: string }[]>([])
  const [activeOrg, setActiveOrg] = useState<string | null>(null)
  useEffect(() => {
    fetch('/api/carcare/garages')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        setGarages(d.garages ?? [])
        setActiveOrg(d.activeOrganizationId ?? null)
      })
      .catch(() => setGarages([]))
  }, [])

  const switchGarage = async (organizationId: string) => {
    const res = await fetch('/api/carcare/active-garage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId }),
    })
    if (res.ok) window.location.reload()
  }

  const addProvider = async () => {
    if (!provName.trim()) return
    setProvBusy(true)
    try {
      const res = await fetch('/api/carcare/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: provName.trim(),
          phone: provPhone.trim() || null,
          email: provEmail.trim() || null,
          bookingUrl: provBooking.trim() || null,
          address: provAddress.trim() || null,
        }),
      })
      if (res.ok) {
        setProvName('')
        setProvPhone('')
        setProvEmail('')
        setProvBooking('')
        setProvAddress('')
        setProvForm(false)
        loadProviders()
      }
    } finally {
      setProvBusy(false)
    }
  }

  const archiveProvider = async (id: string) => {
    setProvBusy(true)
    try {
      const res = await fetch(`/api/carcare/providers/${id}/archive`, { method: 'POST' })
      if (res.ok) loadProviders()
    } finally {
      setProvBusy(false)
    }
  }

  const toggleExpanded = (userId: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })

  const toggleAccess = async (userId: string, vehicleId: string, grant: boolean) => {
    setAccessBusy(`${userId}:${vehicleId}`)
    try {
      const res = await fetch(`/api/carcare/garage/members/${userId}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, grant }),
      })
      if (res.ok) reload()
    } finally {
      setAccessBusy(null)
    }
  }

  const invite = async () => {
    setError(null)
    setNotice(null)
    const target = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      setError(t('garage.inviteBad'))
      return
    }
    setInviting(true)
    try {
      const res = await fetch('/api/carcare/garage/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target, role }),
      })
      if (!res.ok) {
        setError(t('garage.inviteFailed'))
        return
      }
      const data = await res.json().catch(() => ({}))
      setNotice(
        data?.emailSent ? t('garage.inviteSent', { email: target }) : t('garage.inviteCreated'),
      )
      setEmail('')
      reload()
    } finally {
      setInviting(false)
    }
  }

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(inviteUrl(token))
      setCopied(token)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setCopied(null)
    }
  }

  const revoke = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/carcare/garage/invitations/${id}/revoke`, { method: 'POST' })
      if (res.ok) reload()
    } finally {
      setBusyId(null)
    }
  }

  const removeMember = async (userId: string) => {
    setBusyId(userId)
    try {
      const res = await fetch(`/api/carcare/garage/members/${userId}/remove`, { method: 'POST' })
      if (res.ok) reload()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <header className="flex items-start gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-pictus-lime/15 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7 text-pictus-lime" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-light">{t('garage.title')}</h1>
            <p className="text-gray-400">{t('garage.subtitle')}</p>
            {garages.length > 1 && (
              <select
                value={activeOrg ?? ''}
                onChange={(e) => switchGarage(e.target.value)}
                className="mt-3 bg-pictus-onyx900 border border-white/10 rounded-xl px-3 py-2 text-sm text-pictus-white focus:border-pictus-lime/50 focus:outline-none"
              >
                {garages.map((g) => (
                  <option key={g.organizationId} value={g.organizationId}>
                    {g.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </header>

        {data.vehicles.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">
              {t('garage.vehicles')} ({data.vehicles.length})
            </h2>
            <div className="space-y-3">
              {data.vehicles.map((v) => (
                <Link
                  key={v.id}
                  href={`/client/my-fleet/vehicles/${v.id}`}
                  className="flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06] hover:border-white/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-gray-400">
                    <Car className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-pictus-white font-medium truncate">{v.name}</p>
                    <p className="text-sm text-gray-400 truncate">{v.registration}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            {t('garage.members')} ({data.members.length})
          </h2>
          <div className="space-y-3">
            {data.members.map((m) => {
              const manageable = data.canManage && m.role !== 'OWNER' && data.vehicles.length > 0
              const isOpen = expanded.has(m.userId)
              return (
                <div
                  key={m.userId}
                  className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06]"
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm text-gray-300">
                      {initials(m)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-pictus-white font-medium break-words">
                        {memberLabel(m, t)}{' '}
                        {m.isYou && <span className="text-gray-400">{t('garage.you')}</span>}
                      </p>
                      {m.email && m.name && (
                        <p className="text-sm text-gray-400 truncate">{m.email}</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
                        m.role === 'OWNER'
                          ? 'bg-pictus-lime/15 text-pictus-lime border border-pictus-lime/30'
                          : 'bg-white/5 text-gray-300 border border-white/10'
                      }`}
                    >
                      {m.role === 'OWNER' && <Shield className="w-3 h-3" />}
                      {t(`role.${m.role}`)}
                    </span>
                    {manageable && (
                      <button
                        onClick={() => toggleExpanded(m.userId)}
                        className="shrink-0 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-pictus-white"
                        aria-label={t('garage.access')}
                      >
                        <Car className="w-4 h-4" />
                        {m.vehicleIds.length === 0
                          ? t('common.all')
                          : `${m.vehicleIds.length}/${data.vehicles.length}`}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                    {data.canManage && !m.isYou && m.role !== 'OWNER' && (
                      <button
                        onClick={() => removeMember(m.userId)}
                        disabled={busyId === m.userId}
                        className="shrink-0 text-gray-500 hover:text-red-400 disabled:opacity-50"
                        aria-label={t('garage.removeMember')}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {manageable && isOpen && (
                    <div className="border-t border-white/[0.06] px-4 py-3">
                      <p className="text-xs text-gray-500 mb-2">{t('garage.access')}</p>
                      <div className="space-y-1">
                        {data.vehicles.map((v) => {
                          const has = m.vehicleIds.includes(v.id)
                          const key = `${m.userId}:${v.id}`
                          return (
                            <label
                              key={v.id}
                              className="flex items-center justify-between gap-3 py-1.5 cursor-pointer"
                            >
                              <span className="text-sm text-pictus-white truncate">
                                {v.name} <span className="text-gray-500">· {v.registration}</span>
                              </span>
                              <input
                                type="checkbox"
                                checked={has}
                                disabled={accessBusy === key}
                                onChange={(e) => toggleAccess(m.userId, v.id, e.target.checked)}
                                className="w-4 h-4 accent-pictus-lime shrink-0 disabled:opacity-50"
                              />
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {data.canManage && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">{t('garage.inviteMember')}</h2>
            <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    className="w-full bg-pictus-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none"
                    placeholder={t('garage.inviteEmailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative w-full sm:w-auto">
                  <select
                    className="appearance-none w-full sm:w-auto bg-pictus-black/40 border border-white/10 rounded-xl pl-4 pr-9 py-2.5 text-pictus-white focus:border-pictus-lime/50 focus:outline-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'MEMBER' | 'VIEWER')}
                  >
                    <option value="MEMBER">{t('role.MEMBER')}</option>
                    <option value="VIEWER">{t('role.VIEWER')}</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <button
                  onClick={invite}
                  disabled={inviting}
                  className="inline-flex items-center justify-center gap-2 bg-pictus-lime text-pictus-black font-semibold px-5 py-2.5 rounded-xl hover:bg-pictus-lime600 transition-colors disabled:opacity-50"
                >
                  {inviting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> {t('garage.invite')}
                    </>
                  )}
                </button>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {notice && <p className="text-sm text-pictus-lime">{notice}</p>}
              <p className="text-xs text-gray-500">{t('garage.inviteHint')}</p>
            </div>
          </section>
        )}

        {data.invitations.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-3">{t('garage.pending')}</h2>
            <div className="space-y-3">
              {data.invitations.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06]"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-pictus-white font-medium truncate">{i.email}</p>
                    <p className="text-sm text-gray-400">
                      {t('garage.pendingMeta', { role: t(`role.${i.role}`) })}
                    </p>
                  </div>
                  <button
                    onClick={() => copy(i.token)}
                    className="shrink-0 inline-flex items-center gap-1.5 text-sm text-pictus-lime hover:text-pictus-lime600"
                  >
                    {copied === i.token ? (
                      <>
                        <Check className="w-4 h-4" /> {t('garage.copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> {t('garage.link')}
                      </>
                    )}
                  </button>
                  {data.canManage && (
                    <button
                      onClick={() => revoke(i.id)}
                      disabled={busyId === i.id}
                      className="shrink-0 text-gray-500 hover:text-red-400 disabled:opacity-50"
                      aria-label={t('garage.revokeInvite')}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">{t('garage.providers')}</h2>
            {data.canManage && !provForm && (
              <button
                onClick={() => setProvForm(true)}
                className="text-sm text-pictus-lime hover:text-pictus-lime600 inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> {t('common.add')}
              </button>
            )}
          </div>

          {provForm && (
            <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-3 mb-3">
              <input
                className="w-full bg-pictus-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none"
                placeholder={t('garage.provNamePlaceholder')}
                value={provName}
                onChange={(e) => setProvName(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="w-full bg-pictus-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none"
                  placeholder={t('garage.provPhone')}
                  value={provPhone}
                  onChange={(e) => setProvPhone(e.target.value)}
                />
                <input
                  className="w-full bg-pictus-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none"
                  placeholder={t('garage.provEmail')}
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                />
              </div>
              <input
                className="w-full bg-pictus-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none"
                placeholder={t('garage.provBooking')}
                value={provBooking}
                onChange={(e) => setProvBooking(e.target.value)}
              />
              <input
                className="w-full bg-pictus-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none"
                placeholder={t('garage.provAddress')}
                value={provAddress}
                onChange={(e) => setProvAddress(e.target.value)}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={addProvider}
                  disabled={provBusy}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-pictus-lime text-pictus-black font-semibold px-4 py-2 rounded-xl hover:bg-pictus-lime600 transition-colors disabled:opacity-50"
                >
                  {provBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save')}
                </button>
                <button
                  onClick={() => setProvForm(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-center text-gray-400 hover:text-pictus-white"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {providers.length === 0 && !provForm ? (
            <div className="p-6 text-center bg-pictus-onyx900 rounded-2xl border border-white/[0.06] text-gray-400">
              {t('garage.providersEmpty')}
            </div>
          ) : (
            <div className="space-y-3">
              {providers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06]"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-gray-400">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-pictus-white font-medium truncate">{p.name}</p>
                    {(p.phone || p.email) && (
                      <p className="text-sm text-gray-400 truncate">
                        {[p.phone, p.email].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {p.address && (
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {p.address}
                      </p>
                    )}
                  </div>
                  {p.address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-pictus-lime"
                      aria-label={t('garage.provMap')}
                    >
                      <MapPin className="w-4 h-4" />
                    </a>
                  )}
                  {p.phone && (
                    <a
                      href={`tel:${p.phone}`}
                      className="shrink-0 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-pictus-lime"
                      aria-label={t('garage.callProvider')}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  {p.email && (
                    <a
                      href={`mailto:${p.email}`}
                      className="shrink-0 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-pictus-lime"
                      aria-label={t('garage.emailProvider')}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                  {p.bookingUrl && (
                    <a
                      href={p.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-pictus-lime"
                      aria-label={t('garage.bookOnline')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {data.canManage && (
                    <button
                      onClick={() => archiveProvider(p.id)}
                      disabled={provBusy}
                      className="shrink-0 text-gray-500 hover:text-red-400 disabled:opacity-50"
                      aria-label={t('garage.removeProvider')}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
