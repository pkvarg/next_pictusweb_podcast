'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/routing'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Link } from '@/i18n/routing'

type State = 'working' | 'done' | 'error'

export default function CarCareAcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [state, setState] = useState<State>('working')
  const started = useRef(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/auth/login?callbackUrl=${encodeURIComponent(`/carcare/invite/${token}`)}`)
    }
  }, [status, router, token])

  useEffect(() => {
    if (status !== 'authenticated' || started.current) return
    started.current = true
    fetch('/api/carcare/garage/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((r) => setState(r.ok ? 'done' : 'error'))
      .catch(() => setState('error'))
  }, [status, token])

  useEffect(() => {
    if (state !== 'done') return
    const t = setTimeout(() => router.replace('/carcare'), 1500)
    return () => clearTimeout(t)
  }, [state, router])

  return (
    <div className="min-h-screen bg-pictus-black text-pictus-white font-brutal-milk flex items-center justify-center px-6">
      <div className="text-center">
        {state === 'working' && (
          <>
            <Loader2 className="w-10 h-10 text-pictus-lime animate-spin mx-auto" />
            <p className="mt-4 text-gray-400">Spracúvam pozvánku…</p>
          </>
        )}
        {state === 'done' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-pictus-lime mx-auto" />
            <h1 className="mt-4 text-2xl font-light">Pozvánka prijatá</h1>
            <p className="mt-2 text-gray-400">Presmerúvam vás do garáže…</p>
          </>
        )}
        {state === 'error' && (
          <>
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h1 className="mt-4 text-2xl font-light">Pozvánku sa nepodarilo prijať</h1>
            <p className="mt-2 text-gray-400">Odkaz je neplatný, už bol použitý alebo vypršal.</p>
            <Link
              href="/carcare"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-pictus-lime px-5 py-2.5 font-semibold text-pictus-black hover:bg-pictus-lime600 transition-colors"
            >
              Prejsť do CarCare
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
