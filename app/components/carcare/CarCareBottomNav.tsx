'use client'

import { useTranslations } from 'next-intl'
import { Home, Calendar, Wallet, Users, Car } from 'lucide-react'
import { Link, usePathname } from '@/i18n/routing'

const TABS: { key: string; tkey: string; href: string; icon: React.ReactNode }[] = [
  { key: 'home', tkey: 'nav.home', href: '/client/my-fleet', icon: <Home className="w-5 h-5" /> },
  {
    key: 'events',
    tkey: 'nav.events',
    href: '/client/my-fleet/events',
    icon: <Calendar className="w-5 h-5" />,
  },
  { key: 'costs', tkey: 'nav.costs', href: '/client/my-fleet/costs', icon: <Wallet className="w-5 h-5" /> },
  {
    key: 'garage',
    tkey: 'nav.garage',
    href: '/client/my-fleet/garage',
    icon: <Users className="w-5 h-5" />,
  },
]

function activeTab(pathname: string): string {
  if (pathname.startsWith('/client/my-fleet/events')) return 'events'
  if (pathname.startsWith('/client/my-fleet/costs')) return 'costs'
  if (pathname.startsWith('/client/my-fleet/garage')) return 'garage'
  return 'home'
}

export default function CarCareBottomNav() {
  const pathname = usePathname()
  const tr = useTranslations('CarCare')
  if (pathname.startsWith('/client/my-fleet/invite')) return null
  const current = activeTab(pathname)

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 flex-col bg-pictus-onyx900/95 border-r border-white/[0.06] py-6 px-3 z-40">
        <Link href="/client/my-fleet" className="flex items-center gap-2 px-3 mb-8">
          <Car className="w-6 h-6 text-pictus-lime" />
          <span className="font-brutal-milk text-lg text-pictus-white">FleetSync</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`inline-flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                t.key === current
                  ? 'bg-pictus-lime/15 text-pictus-lime'
                  : 'text-gray-400 hover:text-pictus-white hover:bg-white/5'
              }`}
            >
              {t.icon}
              {tr(t.tkey)}
            </Link>
          ))}
        </nav>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-pictus-onyx900/95 backdrop-blur border-t border-white/[0.06] z-40">
        <div className="mx-auto max-w-4xl grid grid-cols-4 text-center text-[11px]">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className={`py-2.5 flex flex-col items-center gap-0.5 ${
                t.key === current ? 'text-pictus-lime' : 'text-gray-400 hover:text-pictus-white'
              }`}
            >
              {t.icon}
              <span>{tr(t.tkey)}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
