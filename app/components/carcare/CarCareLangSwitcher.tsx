'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'

const LOCALES = [
  { code: 'sk', label: 'SK' },
  { code: 'en', label: 'EN' },
  { code: 'hu', label: 'HU' },
] as const

export default function CarCareLangSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/10 bg-pictus-onyx900/80 p-0.5 ${className}`}
    >
      {LOCALES.map((l) => {
        const active = locale === l.code
        return (
          <button
            key={l.code}
            onClick={() => router.replace(pathname, { locale: l.code })}
            aria-current={active}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              active ? 'bg-pictus-lime text-pictus-black' : 'text-gray-400 hover:text-pictus-white'
            }`}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}
