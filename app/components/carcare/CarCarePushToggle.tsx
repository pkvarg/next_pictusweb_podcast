'use client'

import { useEffect, useState } from 'react'
import { Bell, Loader2 } from 'lucide-react'

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export default function CarCarePushToggle() {
  const [supported, setSupported] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const ok =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      !!VAPID
    setSupported(ok)
    if (!ok) return
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(!!sub))
      .catch(() => {})
  }, [])

  const enable = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setMsg('Povolenie bolo zamietnuté v prehliadači.')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID!) as BufferSource,
      })
      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } }
      const res = await fetch('/api/carcare/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })
      if (res.ok) {
        setEnabled(true)
        setMsg('Notifikácie sú zapnuté.')
      } else {
        setMsg('Notifikácie sa nepodarilo uložiť.')
      }
    } catch {
      setMsg('Notifikácie sa nepodarilo zapnúť.')
    } finally {
      setBusy(false)
    }
  }

  const disable = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/carcare/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setEnabled(false)
      setMsg('Notifikácie sú vypnuté.')
    } catch {
      setMsg('Notifikácie sa nepodarilo vypnúť.')
    } finally {
      setBusy(false)
    }
  }

  const test = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await fetch('/api/carcare/push/test', { method: 'POST' })
      setMsg(res.ok ? 'Testovacia notifikácia odoslaná.' : 'Test zlyhal.')
    } finally {
      setBusy(false)
    }
  }

  if (!supported) return null

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-3">Notifikácie</h2>
      <div className="bg-pictus-onyx900 rounded-2xl border border-white/[0.06] p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pictus-lime/15 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-pictus-lime" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-pictus-white font-medium">Push notifikácie na tomto zariadení</p>
          <p className="text-sm text-gray-400">
            {enabled ? 'Zapnuté' : 'Pripomienky aj keď máte aplikáciu zatvorenú'}
          </p>
          {msg && <p className="text-sm text-pictus-lime mt-1">{msg}</p>}
        </div>
        {enabled ? (
          <>
            <button
              onClick={test}
              disabled={busy}
              className="shrink-0 text-sm text-gray-300 hover:text-pictus-white px-3 py-1.5 disabled:opacity-50"
            >
              Test
            </button>
            <button
              onClick={disable}
              disabled={busy}
              className="shrink-0 inline-flex items-center gap-2 bg-white/5 text-pictus-white text-sm font-medium px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vypnúť'}
            </button>
          </>
        ) : (
          <button
            onClick={enable}
            disabled={busy}
            className="shrink-0 inline-flex items-center gap-2 bg-pictus-lime text-pictus-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-pictus-lime600 disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Zapnúť'}
          </button>
        )}
      </div>
    </section>
  )
}
