'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Bell, Loader2, Inbox } from 'lucide-react'
import { useRouter } from '@/i18n/routing'

interface InboxItem {
  id: string
  stage: string
  eventId: string
  eventName: string
  vehicle: string
  registration: string
  dueDate: string | null
  sentAt: string | null
  readAt: string | null
}

export default function CarCareNotificationBell() {
  const t = useTranslations('CarCare')
  const locale = useLocale()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<InboxItem[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/carcare/notifications/inbox')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items ?? [])
        setUnread(data.unread ?? 0)
      }
    } catch {
      /* ignore — bell stays quiet on failure */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const markRead = async (ids?: string[]) => {
    const body = ids ? { ids } : { all: true }
    try {
      await fetch('/api/carcare/notifications/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch {
      /* ignore */
    }
  }

  const markAllRead = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })))
    setUnread(0)
    await markRead()
  }

  const openItem = async (item: InboxItem) => {
    if (!item.readAt) {
      setUnread((u) => Math.max(0, u - 1))
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, readAt: new Date().toISOString() } : i)),
      )
      void markRead([item.id])
    }
    setOpen(false)
    router.push(`/client/my-fleet/events/${item.eventId}`)
  }

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : ''

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('dash.bellAria')}
        className="relative text-gray-300 hover:text-pictus-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[0.65rem] font-bold">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-pictus-onyx900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="font-medium text-pictus-white">{t('inbox.title')}</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-pictus-lime hover:text-pictus-lime600"
              >
                {t('inbox.markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 px-4 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                <Inbox className="w-6 h-6 text-gray-600" />
                {t('inbox.empty')}
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openItem(item)}
                  className={`w-full text-left px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/5 flex gap-3 ${
                    item.readAt ? 'opacity-60' : ''
                  }`}
                >
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      item.readAt ? 'bg-transparent' : 'bg-pictus-lime'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-pictus-white font-medium truncate">
                      {item.eventName}
                    </span>
                    <span className="block text-xs text-gray-400 truncate">
                      {item.vehicle} · {item.registration}
                    </span>
                    {item.dueDate && (
                      <span className="block text-xs text-gray-500">
                        {t('inbox.due')}: {fmt(item.dueDate)}
                      </span>
                    )}
                  </span>
                  {item.sentAt && (
                    <span className="text-[11px] text-gray-500 shrink-0">{fmt(item.sentAt)}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
