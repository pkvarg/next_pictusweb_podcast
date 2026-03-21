'use client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Globe, ChevronDown } from 'lucide-react'

const LanguageBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const path = pathname.slice(4)
  const currentLang = pathname.slice(1, 3)

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', label: 'EN' },
    { code: 'sk', name: 'Slovenčina', flag: '🇸🇰', label: 'SK' },
    { code: 'hu', name: 'Magyar', flag: '🇭🇺', label: 'HU' },
  ]

  const handleLanguage = (lang: string) => {
    router.replace(`/${lang}/${path}`)
    setIsOpen(false)
  }

  const currentLanguage = languages.find((lang) => lang.code === currentLang) || languages[0]

  return (
    <div className="">
      {/* Desktop version - horizontal */}
      <div className="hidden md:flex flex-row gap-1 items-center rounded-full px-2 py-0 border border-pictus-white/10">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`px-3 py-0 rounded-full text-[20px] font-medium transition-all duration-200 flex items-center gap-2 ${
              currentLang === lang.code
                ? 'border-2 border-pictus-lime text-pictus-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10 border-2 border-transparent'
            }`}
            onClick={() => handleLanguage(lang.code)}
          >
            <span className="text-base">{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile version - dropdown */}
      <div className="md:hidden relative">
        <button
          className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-2 border border-pictus-white/10 hover:bg-white/10 transition-all duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Globe className="w-4 h-4 text-pictus-lime" />
          <span className="text-base">{currentLanguage.flag}</span>
          <span className="text-sm font-medium">{currentLanguage.label}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-md rounded-2xl border border-pictus-white/10 shadow-2xl overflow-hidden z-50 min-w-[160px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-200 ${
                  currentLang === lang.code
                    ? 'text-white border-l-2 border-pictus-lime bg-pictus-lime/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => handleLanguage(lang.code)}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{lang.label}</span>
                  <span className="text-xs text-gray-400">{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />}
    </div>
  )
}

export default LanguageBar
