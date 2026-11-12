'use client'

import { useTranslations } from 'next-intl'
import { Home, Calendar, Wallet, Users, Car, Settings, UserCircle, ArrowLeft } from 'lucide-react'
import { Link, usePathname } from '@/i18n/routing'
import CarCareThemeToggle from './CarCareThemeToggle'
import CarCareLangSwitcher from './CarCareLangSwitcher'

const TABS: { key: string; tkey: string; href: string; icon: React.ReactNode }[] = [
  { key: 'home', tkey: 'nav.home', href: '/client/my-fleet', icon: <Home className="w-5 h-5" /> },
  {
    key: 'events',
    tkey: 'nav.events',
    href: '/client/my-fleet/events',
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    key: 'costs',
    tkey: 'nav.costs',
    href: '/client/my-fleet/costs',
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    key: 'garage',
    tkey: 'nav.garage',
    href: '/client/my-fleet/garage',
    icon: <Users className="w-5 h-5" />,
  },
  {
    key: 'account',
    tkey: 'nav.account',
    href: '/client/my-fleet/account',
    icon: <UserCircle className="w-5 h-5" />,
  },
  {
    key: 'settings',
    tkey: 'nav.settings',
    href: '/client/my-fleet/notifications',
    icon: <Settings className="w-5 h-5" />,
  },
]

function activeTab(pathname: string): string {
  if (pathname.startsWith('/client/my-fleet/events')) return 'events'
  if (pathname.startsWith('/client/my-fleet/costs')) return 'costs'
  if (pathname.startsWith('/client/my-fleet/garage')) return 'garage'
  if (pathname.startsWith('/client/my-fleet/account')) return 'account'
  if (pathname.startsWith('/client/my-fleet/notifications')) return 'settings'
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
        <div className="flex items-center justify-between gap-2 px-3 mb-8">
          <Link href="/client/my-fleet" className="flex items-center gap-2">
            <Car className="w-6 h-6 text-pictus-lime" />
            <span className="font-brutal-milk text-lg text-pictus-white">FleetSync</span>
          </Link>
          <CarCareThemeToggle />
        </div>
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
        <div className="mt-auto flex flex-col gap-3">
          <div className="px-3">
            <CarCareLangSwitcher />
          </div>
          <Link
            href="/client"
            className="inline-flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-pictus-white hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
            {tr('nav.backToClient')}
          </Link>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-pictus-onyx900/95 backdrop-blur border-t border-white/[0.06] z-40">
        <div className="flex items-center justify-center gap-2 py-1.5 border-b border-white/[0.06]">
          <CarCareThemeToggle />
          <CarCareLangSwitcher />
        </div>
        <div className="mx-auto max-w-4xl grid grid-cols-6 text-center text-[11px]">
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

      <Link
        href="/client"
        aria-label={tr('nav.backToClient')}
        className="md:hidden fixed left-3 bottom-28 z-50 inline-flex items-center gap-1.5 rounded-full bg-pictus-onyx900/95 border border-white/[0.06] px-3 py-2 text-xs text-gray-300 hover:text-pictus-white"
      >
        <ArrowLeft className="w-4 h-4" />
        {tr('nav.backToClient')}
      </Link>
    </>
  )
}
