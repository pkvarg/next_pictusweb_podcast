import { Home, Calendar, Wallet, Users } from 'lucide-react'
import { Link } from '@/i18n/routing'

type Tab = 'home' | 'events' | 'costs' | 'garage'

const TABS: { key: Tab; label: string; href: string; icon: React.ReactNode }[] = [
  { key: 'home', label: 'Domov', href: '/carcare', icon: <Home className="w-5 h-5" /> },
  {
    key: 'events',
    label: 'Udalosti',
    href: '/carcare/events',
    icon: <Calendar className="w-5 h-5" />,
  },
  { key: 'costs', label: 'Náklady', href: '/carcare/costs', icon: <Wallet className="w-5 h-5" /> },
  { key: 'garage', label: 'Garáž', href: '/carcare/garage', icon: <Users className="w-5 h-5" /> },
]

export default function CarCareBottomNav({ current }: { current: Tab }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-pictus-onyx900/95 backdrop-blur border-t border-white/[0.06]">
      <div className="mx-auto max-w-4xl grid grid-cols-4 text-center text-[11px]">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`py-2.5 flex flex-col items-center gap-0.5 ${t.key === current ? 'text-pictus-lime' : 'text-gray-400 hover:text-pictus-white'}`}
          >
            {t.icon}
            <span>{t.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
