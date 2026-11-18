'use client'

import { useLocale, useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/routing'

const LOCALES = [
  { code: 'sk', label: 'SK' },
  { code: 'en', label: 'EN' },
  { code: 'hu', label: 'HU' },
  { code: 'de', label: 'DE' },
] as const

export default function CarCareLangSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('Landing')

  return (
    <>
      <div className={`relative inline-flex items-center md:hidden ${className}`}>
        <select
          aria-label={t('nav.changeLanguage')}
          value={locale}
          onChange={(event) =>
            router.replace(pathname, {
              locale: event.target.value as (typeof LOCALES)[number]['code'],
            })
          }
          className="appearance-none rounded-full border border-white/10 bg-pictus-onyx900/80 py-1.5 pl-3 pr-7 text-xs font-medium text-pictus-white cursor-pointer"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-gray-400"
        />
      </div>
      <div
        className={`hidden md:inline-flex items-center rounded-full border border-white/10 bg-pictus-onyx900/80 p-0.5 ${className}`}
      >
        {LOCALES.map((l) => {
          const active = locale === l.code
          return (
            <button
              key={l.code}
              onClick={() => router.replace(pathname, { locale: l.code })}
              aria-current={active}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                active
                  ? 'bg-pictus-lime text-pictus-black'
                  : 'text-gray-400 hover:text-pictus-white'
              }`}
            >
              {l.label}
            </button>
          )
        })}
      </div>
    </>
  )
}
