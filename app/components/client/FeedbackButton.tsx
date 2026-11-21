'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { MessageSquarePlus, X, Loader2, CheckCircle, ChevronDown } from 'lucide-react'

interface Copy {
  button: string
  title: string
  desc: string
  categoryLabel: string
  cats: string[]
  placeholder: string
  send: string
  sending: string
  success: string
  error: string
  empty: string
}

const i18n: Record<string, Copy> = {
  sk: {
    button: 'Podnet',
    title: 'Pošlite nám podnet',
    desc: 'Nápad, chyba alebo čokoľvek, čo by sme mali vedieť.',
    categoryLabel: 'Typ',
    cats: ['Nápad', 'Chyba', 'Iné'],
    placeholder: 'Napíšte svoj podnet…',
    send: 'Odoslať',
    sending: 'Odosiela sa…',
    success: 'Ďakujeme! Podnet sme dostali.',
    error: 'Odoslanie zlyhalo. Skúste to znova.',
    empty: 'Napíšte prosím text.',
  },
  en: {
    button: 'Feedback',
    title: 'Send us feedback',
    desc: 'An idea, a bug, or anything we should know.',
    categoryLabel: 'Type',
    cats: ['Idea', 'Bug', 'Other'],
    placeholder: 'Write your feedback…',
    send: 'Send',
    sending: 'Sending…',
    success: 'Thank you! We got your feedback.',
    error: 'Sending failed. Please try again.',
    empty: 'Please write something.',
  },
  hu: {
    button: 'Visszajelzés',
    title: 'Küldjön visszajelzést',
    desc: 'Ötlet, hiba vagy bármi, amit tudnunk kellene.',
    categoryLabel: 'Típus',
    cats: ['Ötlet', 'Hiba', 'Egyéb'],
    placeholder: 'Írja le a visszajelzését…',
    send: 'Küldés',
    sending: 'Küldés…',
    success: 'Köszönjük! Megkaptuk a visszajelzést.',
    error: 'A küldés nem sikerült. Próbálja újra.',
    empty: 'Kérjük, írjon valamit.',
  },
  de: {
    button: 'Feedback',
    title: 'Senden Sie uns Feedback',
    desc: 'Eine Idee, ein Fehler oder alles, was wir wissen sollten.',
    categoryLabel: 'Art',
    cats: ['Idee', 'Fehler', 'Sonstiges'],
    placeholder: 'Schreiben Sie Ihr Feedback…',
    send: 'Senden',
    sending: 'Wird gesendet…',
    success: 'Danke! Wir haben Ihr Feedback erhalten.',
    error: 'Senden fehlgeschlagen. Bitte erneut versuchen.',
    empty: 'Bitte schreiben Sie etwas.',
  },
}

export default function FeedbackButton({ variant = 'icon' }: { variant?: 'icon' | 'nav' }) {
  const params = useParams()
  const locale = (params?.locale as string) || 'sk'
  const t = i18n[locale] ?? i18n.sk

  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState(t.cats[0])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setMessage('')
    setCategory(t.cats[0])
    setSent(false)
    setError('')
    setSending(false)
  }

  const close = () => {
    setOpen(false)
    // small delay so the closing animation (if any) doesn't show a reset flash
    setTimeout(reset, 200)
  }

  const submit = async () => {
    if (!message.trim()) {
      setError(t.empty)
      return
    }
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/client/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), category }),
      })
      if (!res.ok) throw new Error('failed')
      setSent(true)
    } catch {
      setError(t.error)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {variant === 'nav' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-pictus-white"
        >
          <MessageSquarePlus className="h-5 w-5 text-pictus-lime" />
          {t.button}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-6 w-6 shrink-0 items-center justify-center text-pictus-lime transition-colors hover:text-pictus-lime600"
          aria-label={t.button}
          title={t.button}
        >
          <MessageSquarePlus className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-pictus-black p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="feedback-title" className="text-lg font-bold text-white">
                  {t.title}
                </h2>
                <p className="mt-1 text-sm text-gray-400">{t.desc}</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-gray-400 transition hover:text-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle className="h-12 w-12 text-pictus-lime" />
                <p className="text-sm text-gray-200">{t.success}</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-2 rounded-full bg-pictus-lime px-6 py-2 text-sm font-semibold text-pictus-black transition hover:bg-pictus-lime600"
                >
                  OK
                </button>
              </div>
            ) : (
              <>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  {t.categoryLabel}
                </label>
                <div className="relative mb-3">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-9 text-sm text-gray-200 focus:border-pictus-lime focus:outline-none"
                  >
                    {t.cats.map((c) => (
                      <option key={c} value={c} className="bg-pictus-black">
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.placeholder}
                  rows={5}
                  maxLength={5000}
                  className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-pictus-lime focus:outline-none"
                />

                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

                <button
                  type="button"
                  onClick={submit}
                  disabled={sending}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-pictus-lime px-6 py-3 text-sm font-semibold text-pictus-black transition hover:bg-pictus-lime600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> {t.sending}
                    </>
                  ) : (
                    t.send
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
