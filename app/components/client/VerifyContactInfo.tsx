'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Mail, Phone, CheckCircle, ShieldAlert, Loader2, X, Check } from 'lucide-react'

interface VerificationStatus {
  emailVerified: string | null
  phoneVerified: string | null
  phoneNumber: string | null
}

type ContactType = 'email' | 'phone'

interface VerifyState {
  sending: boolean
  verificationToken: string | null
  code: string
  verifying: boolean
  error: string
  success: boolean
}

const defaultVerifyState = (): VerifyState => ({
  sending: false,
  verificationToken: null,
  code: '',
  verifying: false,
  error: '',
  success: false,
})

export default function VerifyContactInfo() {
  const t = useTranslations('Client')
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<VerifyState>(defaultVerifyState())
  const [phone, setPhone] = useState<VerifyState>(defaultVerifyState())

  useEffect(() => {
    fetch('/api/user/contact-status')
      .then((r) => r.json())
      .then((data) => {
        setStatus(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const sendCode = async (type: ContactType) => {
    const setState = type === 'email' ? setEmail : setPhone
    setState((s) => ({ ...s, sending: true, error: '' }))

    const endpoint =
      type === 'email'
        ? '/api/user/send-email-verification'
        : '/api/user/send-phone-verification'

    try {
      const res = await fetch(endpoint, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('verifyContactSendError'))
      setState((s) => ({ ...s, sending: false, verificationToken: data.verificationToken }))
    } catch (err: any) {
      setState((s) => ({ ...s, sending: false, error: err.message }))
    }
  }

  const verifyCode = async (type: ContactType) => {
    const state = type === 'email' ? email : phone
    const setState = type === 'email' ? setEmail : setPhone

    setState((s) => ({ ...s, verifying: true, error: '' }))

    try {
      const res = await fetch('/api/user/verify-contact-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationToken: state.verificationToken,
          code: state.code,
          type,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg =
          data.attemptsRemaining !== undefined
            ? t('verifyContactAttemptsRemaining', { error: data.error, attempts: data.attemptsRemaining })
            : data.error || t('verifyContactVerifyError')
        throw new Error(msg)
      }
      setState((s) => ({ ...s, verifying: false, success: true }))
      setStatus((prev) =>
        prev
          ? { ...prev, [type === 'email' ? 'emailVerified' : 'phoneVerified']: new Date().toISOString() }
          : prev,
      )
    } catch (err: any) {
      setState((s) => ({ ...s, verifying: false, error: err.message }))
    }
  }

  const cancel = (type: ContactType) => {
    const setState = type === 'email' ? setEmail : setPhone
    setState(defaultVerifyState())
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{t('verifyContactLoading')}</span>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <ShieldAlert className="w-5 h-5 text-pictus-lime" />
        <h3 className="text-xl font-normal text-pictus-white">{t('verifyContactTitle')}</h3>
      </div>

      {/* Email */}
      <ContactRow
        type="email"
        label="Email"
        icon={<Mail className="w-4 h-4" />}
        verified={!!status?.emailVerified}
        verifyState={email}
        onSend={() => sendCode('email')}
        onVerify={() => verifyCode('email')}
        onCodeChange={(v) => setEmail((s) => ({ ...s, code: v }))}
        onCancel={() => cancel('email')}
        t={t}
      />

      {/* Phone */}
      {status?.phoneNumber ? (
        <ContactRow
          type="phone"
          label={t('verifyContactPhone', { number: status.phoneNumber })}
          icon={<Phone className="w-4 h-4" />}
          verified={!!status?.phoneVerified}
          verifyState={phone}
          onSend={() => sendCode('phone')}
          onVerify={() => verifyCode('phone')}
          onCodeChange={(v) => setPhone((s) => ({ ...s, code: v }))}
          onCancel={() => cancel('phone')}
          t={t}
        />
      ) : (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>{t('verifyContactNoPhone')}</span>
        </div>
      )}
    </div>
  )
}

interface ContactRowProps {
  type: ContactType
  label: string
  icon: React.ReactNode
  verified: boolean
  verifyState: VerifyState
  onSend: () => void
  onVerify: () => void
  onCodeChange: (v: string) => void
  onCancel: () => void
  t: ReturnType<typeof useTranslations<'Client'>>
}

function ContactRow({
  label,
  icon,
  verified,
  verifyState,
  onSend,
  onVerify,
  onCodeChange,
  onCancel,
  t,
}: ContactRowProps) {
  const { sending, verificationToken, code, verifying, error, success } = verifyState

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-300 text-sm flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {verified || success ? (
          <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" />
            {t('verifyContactVerified')}
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
              <X className="w-3 h-3" />
              {t('verifyContactNotVerified')}
            </span>
            {!verificationToken && (
              <button
                onClick={onSend}
                disabled={sending}
                className="text-xs px-3 py-1 bg-pictus-lime/10 border border-pictus-lime/30 text-pictus-lime rounded-lg hover:bg-pictus-lime/20 transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                {sending ? t('verifyContactSending') : t('verifyContactVerifyButton')}
              </button>
            )}
          </>
        )}
      </div>

      {verificationToken && !success && (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ''))}
            placeholder={t('verifyContactCodePlaceholder')}
            className="w-36 px-3 py-1.5 bg-pictus-white/5 border border-pictus-white/10 rounded-lg text-pictus-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pictus-lime text-sm tracking-widest"
          />
          <button
            onClick={onVerify}
            disabled={verifying || code.length < 6}
            className="text-xs px-3 py-1.5 bg-pictus-lime text-white rounded-lg font-normal hover:bg-pictus-lime400 transition-all disabled:opacity-50 flex items-center gap-1"
          >
            {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            {verifying ? t('verifyContactVerifying') : t('verifyContactConfirm')}
          </button>
          <button
            onClick={onCancel}
            className="text-xs px-2 py-1.5 text-gray-400 hover:text-pictus-white transition-colors"
          >
            {t('verifyContactCancel')}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}
