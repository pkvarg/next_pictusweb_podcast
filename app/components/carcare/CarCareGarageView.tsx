'use client'

import { useState } from 'react'
import { Users, UserPlus, X, Copy, Check, Loader2, Shield, Mail } from 'lucide-react'
import CarCareBottomNav from './CarCareBottomNav'

export interface GarageMember {
  userId: string
  role: 'OWNER' | 'MEMBER' | 'VIEWER'
  name: string | null
  email: string | null
  isYou: boolean
  implicit: boolean
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
}

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Vlastník',
  MEMBER: 'Člen',
  VIEWER: 'Prehliadač',
  ADMIN: 'Administrátor',
}

function memberLabel(m: GarageMember) {
  return m.name || m.email || 'Používateľ'
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
  const base = window.location.pathname.split('/carcare')[0]
  return `${window.location.origin}${base}/carcare/invite/${token}`
}

export default function CarCareGarageView({
  data,
  reload,
}: {
  data: GarageData
  reload: () => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'MEMBER' | 'VIEWER'>('MEMBER')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const invite = async () => {
    setError(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Zadajte platný e-mail.')
      return
    }
    setInviting(true)
    try {
      const res = await fetch('/api/carcare/garage/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      })
      if (!res.ok) {
        setError('Pozvánku sa nepodarilo vytvoriť.')
        return
      }
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
          <div>
            <h1 className="text-3xl font-light">Garáž</h1>
            <p className="text-gray-400">Členovia a prístup k vozidlám</p>
          </div>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Členovia ({data.members.length})</h2>
          <div className="space-y-3">
            {data.members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center gap-3 p-4 bg-pictus-onyx900 rounded-2xl border border-white/[0.06]"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 text-sm text-gray-300">
                  {initials(m)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-pictus-white font-medium truncate">
                    {memberLabel(m)} {m.isYou && <span className="text-gray-400">(vy)</span>}
                  </p>
                  {m.email && m.name && <p className="text-sm text-gray-400 truncate">{m.email}</p>}
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${
                    m.role === 'OWNER'
                      ? 'bg-pictus-lime/15 text-pictus-lime border border-pictus-lime/30'
                      : 'bg-white/5 text-gray-300 border border-white/10'
                  }`}
                >
                  {m.role === 'OWNER' && <Shield className="w-3 h-3" />}
                  {ROLE_LABEL[m.role]}
                </span>
                {data.canManage && !m.isYou && m.role !== 'OWNER' && (
                  <button
                    onClick={() => removeMember(m.userId)}
                    disabled={busyId === m.userId}
                    className="shrink-0 text-gray-500 hover:text-red-400 disabled:opacity-50"
                    aria-label="Odobrať člena"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {data.canManage && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Pozvať člena</h2>
            <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    className="w-full bg-pictus-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none"
                    placeholder="meno@email.sk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <select
                  className="bg-pictus-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-pictus-white focus:border-pictus-lime/50 focus:outline-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'MEMBER' | 'VIEWER')}
                >
                  <option value="MEMBER">Člen</option>
                  <option value="VIEWER">Prehliadač</option>
                </select>
                <button
                  onClick={invite}
                  disabled={inviting}
                  className="inline-flex items-center justify-center gap-2 bg-pictus-lime text-pictus-black font-semibold px-5 py-2.5 rounded-xl hover:bg-pictus-lime600 transition-colors disabled:opacity-50"
                >
                  {inviting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Pozvať
                    </>
                  )}
                </button>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <p className="text-xs text-gray-500">
                Člen môže spravovať pridelené vozidlá, prehliadač ich vidí iba na čítanie. Po
                vytvorení pozvánky skopírujte odkaz a pošlite ho pozvanému.
              </p>
            </div>
          </section>
        )}

        {data.invitations.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-3">Čakajúce pozvánky</h2>
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
                    <p className="text-sm text-gray-400">{ROLE_LABEL[i.role]} · čaká na prijatie</p>
                  </div>
                  <button
                    onClick={() => copy(i.token)}
                    className="shrink-0 inline-flex items-center gap-1.5 text-sm text-pictus-lime hover:text-pictus-lime600"
                  >
                    {copied === i.token ? (
                      <>
                        <Check className="w-4 h-4" /> Skopírované
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Odkaz
                      </>
                    )}
                  </button>
                  {data.canManage && (
                    <button
                      onClick={() => revoke(i.id)}
                      disabled={busyId === i.id}
                      className="shrink-0 text-gray-500 hover:text-red-400 disabled:opacity-50"
                      aria-label="Zrušiť pozvánku"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <CarCareBottomNav current="garage" />
    </div>
  )
}
