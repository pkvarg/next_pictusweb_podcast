'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { Eye, LogOut, Loader2 } from 'lucide-react'

export default function ImpersonationBanner() {
  const { data: session } = useSession()
  const params = useParams()
  const [leaving, setLeaving] = useState(false)

  const impersonatedBy = (session?.user as { impersonatedBy?: string } | undefined)?.impersonatedBy
  if (!impersonatedBy) return null

  const locale = (params?.locale as string) || 'sk'

  const returnToAdmin = async () => {
    setLeaving(true)
    try {
      const res = await fetch('/api/admin/stop-impersonate', { method: 'POST' })
      if (!res.ok) throw new Error('stop failed')
      const { token } = await res.json()
      await signIn('impersonate', { token, callbackUrl: `/${locale}/admin/organizations` })
    } catch {
      setLeaving(false)
    }
  }

  return (
    <div className="sticky top-0 z-[60] bg-amber-500 text-black">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium min-w-0">
          <Eye className="h-4 w-4 shrink-0" />
          <span className="truncate">
            Prihlásený ako <strong>{session?.user?.name || session?.user?.email}</strong> (admin
            náhľad)
          </span>
        </div>
        <button
          onClick={returnToAdmin}
          disabled={leaving}
          className="flex items-center gap-1.5 shrink-0 bg-black/85 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-black transition-colors disabled:opacity-60"
        >
          {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Späť na admin
        </button>
      </div>
    </div>
  )
}
