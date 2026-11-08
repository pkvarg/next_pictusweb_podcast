'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/routing'
import { Loader2, CheckCircle2, AlertTriangle, LogIn, UserPlus, Users } from 'lucide-react'
import { Link } from '@/i18n/routing'

interface InviteInfo {
  valid: boolean
  email?: string
  role?: 'MEMBER' | 'VIEWER'
  hasAccount?: boolean
}

const inputClass =
  'w-full bg-pictus-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-pictus-white placeholder:text-gray-500 focus:border-pictus-lime/50 focus:outline-none'
const labelClass = 'block text-sm text-gray-400 mb-1.5'

export default function CarCareAcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const t = useTranslations('CarCare')
  const { status } = useSession()
  const router = useRouter()

  const [accept, setAccept] = useState<'working' | 'done' | 'error'>('working')
  const [mismatch, setMismatch] = useState(false)
  const started = useRef(false)

  const [info, setInfo] = useState<InviteInfo | null>(null)
  const [mode, setMode] = useState<'choose' | 'register' | 'created'>('choose')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'unauthenticated') return
    fetch(`/api/carcare/garage/invite-info/${token}`)
      .then((r) => r.json())
      .then((d) => setInfo(d))
      .catch(() => setInfo({ valid: false }))
  }, [status, token])

  useEffect(() => {
    if (status !== 'authenticated' || started.current) return
    started.current = true
    fetch('/api/carcare/garage/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        if (r.ok) {
          setAccept('done')
          return
        }
        const d = await r.json().catch(() => ({}))
        setMismatch(d?.error === 'EMAIL_MISMATCH')
        setAccept('error')
      })
      .catch(() => setAccept('error'))
  }, [status, token])

  useEffect(() => {
    if (accept !== 'done') return
    const t = setTimeout(() => router.replace('/client/my-fleet'), 1500)
    return () => clearTimeout(t)
  }, [accept, router])

  const goSignIn = () =>
    router.replace(`/auth/login?callbackUrl=${encodeURIComponent(`/client/my-fleet/invite/${token}`)}`)

  const register = async () => {
    setFormError(null)
    if (!firstName.trim() || !lastName.trim()) {
      setFormError(t('invite.errNameRequired'))
      return
    }
    if (password.length < 8) {
      setFormError(t('invite.errPasswordShort'))
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/carcare/garage/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
        }),
      })
      if (res.status === 409) {
        setFormError(t('invite.errAccountExists'))
        return
      }
      if (!res.ok) {
        setFormError(t('invite.errCreateFailed'))
        return
      }
      setMode('created')
      setTimeout(
        () => router.replace(`/auth/login?callbackUrl=${encodeURIComponent('/client/my-fleet')}`),
        1800,
      )
    } finally {
      setSubmitting(false)
    }
  }

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">{children}</div>
    </div>
  )

  if (status === 'loading') {
    return shell(<Loader2 className="w-10 h-10 text-pictus-lime animate-spin mx-auto" />)
  }

  if (status === 'authenticated') {
    return shell(
      <>
        {accept === 'working' && (
          <>
            <Loader2 className="w-10 h-10 text-pictus-lime animate-spin mx-auto" />
            <p className="mt-4 text-gray-400">{t('invite.processing')}</p>
          </>
        )}
        {accept === 'done' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-pictus-lime mx-auto" />
            <h1 className="mt-4 text-2xl font-light">{t('invite.accepted')}</h1>
            <p className="mt-2 text-gray-400">{t('invite.redirectingGarage')}</p>
          </>
        )}
        {accept === 'error' && (
          <>
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h1 className="mt-4 text-2xl font-light">{t('invite.acceptFailed')}</h1>
            <p className="mt-2 text-gray-400">
              {mismatch ? t('invite.mismatch') : t('invite.invalidLink')}
            </p>
            <Link
              href="/client/my-fleet"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-pictus-lime px-5 py-2.5 font-semibold text-pictus-black hover:bg-pictus-lime600 transition-colors"
            >
              {t('invite.goToCarCare')}
            </Link>
          </>
        )}
      </>,
    )
  }

  if (!info) {
    return shell(<Loader2 className="w-10 h-10 text-pictus-lime animate-spin mx-auto" />)
  }
  if (!info.valid) {
    return shell(
      <>
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h1 className="mt-4 text-2xl font-light">{t('invite.invalidTitle')}</h1>
        <p className="mt-2 text-gray-400">{t('invite.invalidLink')}</p>
      </>,
    )
  }

  if (mode === 'created') {
    return shell(
      <>
        <CheckCircle2 className="w-12 h-12 text-pictus-lime mx-auto" />
        <h1 className="mt-4 text-2xl font-light">{t('invite.accountCreated')}</h1>
        <p className="mt-2 text-gray-400">{t('invite.redirectingLogin')}</p>
      </>,
    )
  }

  return shell(
    <div className="text-left">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-pictus-lime/15 flex items-center justify-center mx-auto mb-3">
          <Users className="w-7 h-7 text-pictus-lime" />
        </div>
        <h1 className="text-2xl font-light">{t('invite.title')}</h1>
        <p className="mt-1 text-gray-400">
          {t.rich('invite.forAs', {
            email: info.email,
            role: t(info.role === 'VIEWER' ? 'invite.roleViewer' : 'invite.roleMember'),
            hl: (chunks) => <span className="text-pictus-white">{chunks}</span>,
          })}
        </p>
      </div>

      {mode === 'choose' ? (
        <div className="space-y-3">
          {info.hasAccount && (
            <p className="text-center text-sm text-gray-400">{t('invite.alreadyAccount')}</p>
          )}
          <button
            onClick={goSignIn}
            className="w-full inline-flex items-center justify-center gap-2 bg-pictus-lime text-pictus-black font-semibold px-4 py-3 rounded-xl hover:bg-pictus-lime600 transition-colors"
          >
            <LogIn className="w-5 h-5" /> {t('invite.signIn')}
          </button>
          {!info.hasAccount && (
            <button
              onClick={() => setMode('register')}
              className="w-full inline-flex items-center justify-center gap-2 bg-white/5 text-pictus-white font-medium px-4 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <UserPlus className="w-5 h-5" /> {t('invite.createAccount')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('invite.firstName')}</label>
              <input
                className={inputClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('invite.lastName')}</label>
              <input
                className={inputClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t('invite.passwordMin')}</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <button
            onClick={register}
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-pictus-lime text-pictus-black font-semibold px-4 py-3 rounded-xl hover:bg-pictus-lime600 transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t('invite.createAndJoin')}
          </button>
          <button
            onClick={() => setMode('choose')}
            className="w-full text-sm text-gray-400 hover:text-pictus-white"
          >
            {t('common.back')}
          </button>
        </div>
      )}
    </div>,
  )
}
