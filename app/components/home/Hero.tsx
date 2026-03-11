'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'
import Image from 'next/image'
import { Figma, Atom, FileCode2, Triangle } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

const languages = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'sk', label: 'SK', flag: '🇸🇰' },
  { code: 'hu', label: 'HU', flag: '🇭🇺' },
]

const Hero = () => {
  const router = useRouter()
  const pathname = usePathname()
  const currentLang = pathname.slice(1, 3)
  const path = pathname.slice(4)

  const handleLanguage = (lang: string) => {
    router.replace(`/${lang}/${path}`)
  }

  return (
    <section className='relative isolate min-h-screen overflow-hidden flex flex-col p-6 md:p-12 justify-between'>
      {/* Background base */}
      <div className='absolute inset-0 z-0 bg-[#161616]' />

      {/* Subtle center glow */}
      <div
        className='absolute inset-0 z-[1] pointer-events-none'
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Faint vertical grid */}
      <div className='absolute inset-0 z-[1] flex justify-evenly pointer-events-none opacity-[0.03]'>
        <div className='w-px h-full bg-white' />
        <div className='w-px h-full bg-white' />
        <div className='w-px h-full bg-white' />
        <div className='w-px h-full bg-white' />
        <div className='w-px h-full bg-white' />
      </div>

      {/* Top Navigation */}
      <header className='flex w-full z-30 items-center justify-between' style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div className='flex items-center gap-16 md:gap-24'>
          <a href='#' className='text-[#F8F8F8] text-[30px] tracking-tight font-normal'>
            Logo
          </a>
          <nav className='hidden md:flex items-center gap-10'>
            <a href='#' className='text-[#F8F8F8]/70 hover:text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light transition-colors'>
              Services
            </a>
            <a href='#' className='text-[#F8F8F8]/70 hover:text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light transition-colors'>
              Our Work
            </a>
            <a href='#' className='text-[#F8F8F8]/70 hover:text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light transition-colors'>
              Process
            </a>
          </nav>
        </div>
        <div className='flex items-center gap-6'>
          <a href='#' className='inline-flex items-center justify-center border border-white/20 rounded-full px-8 py-3 text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light hover:bg-white/5 transition-colors duration-300'>
            Contact
          </a>
          <div className='hidden md:flex items-center gap-1 border border-white/20 rounded-full px-2 py-1'>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-full text-[12px] tracking-wider font-light transition-all duration-200 flex items-center gap-1.5 ${
                  currentLang === lang.code
                    ? 'bg-white/15 text-[#F8F8F8]'
                    : 'text-[#F8F8F8]/50 hover:text-[#F8F8F8] hover:bg-white/5'
                }`}
              >
                <span className='text-[13px]'>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Giant background text */}
      <div
        className='absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none overflow-hidden w-full'
        aria-hidden='true'
      >
        <h1 className='text-[26vw] leading-none font-medium text-[#F8F8F8] tracking-tighter whitespace-nowrap mt-8'>
          PICTUS WORLD
        </h1>
      </div>

      {/* Centered mascot */}
      <div className='absolute inset-0 flex items-center justify-center z-10 pointer-events-none mt-16'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className='animate-float'
        >
          <Image
            src='/hero-mascot.png'
            alt='Pictus Mascot'
            width={800}
            height={800}
            priority
            className='h-[60vh] md:h-[75vh] w-auto max-w-none object-contain drop-shadow-2xl'
          />
        </motion.div>
      </div>

      {/* Bottom content area */}
      <motion.div
        variants={fadeIn('up', 'tween', 0.2, 0.8)}
        initial='hidden'
        whileInView='show'
        viewport={{ once: true, amount: 0.25 }}
        className='flex flex-col md:flex-row justify-between items-end w-full z-30 gap-12 mt-auto pb-4'
      >
        {/* Left: description */}
        <div className='max-w-[420px] w-full'>
          <div className='flex items-center gap-6 mb-8'>
            <div className='h-px w-10 bg-white/40' />
            <span className='text-[#F8F8F8]/80 text-sm tracking-widest uppercase font-light'>
              Creative Studio
            </span>
          </div>
          <p className='text-[#F8F8F8] text-lg md:text-xl font-light leading-relaxed opacity-90'>
            Crafting intuitive digital ecosystems and brand experiences for the
            next generation of creative growth.
          </p>
        </div>

        {/* Right: stack icons */}
        <div className='flex flex-col items-end gap-6 w-full md:w-auto'>
          <div className='flex text-[#F8F8F8]/80 gap-x-6 gap-y-6 items-center'>
            <Figma
              className='w-6 h-6 hover:text-white transition-colors cursor-pointer'
              strokeWidth={1.5}
            />
            <Atom
              className='w-6 h-6 hover:text-white transition-colors cursor-pointer'
              strokeWidth={1.5}
            />
            <FileCode2
              className='w-6 h-6 hover:text-white transition-colors cursor-pointer'
              strokeWidth={1.5}
            />
            <Triangle
              className='w-6 h-6 hover:text-white transition-colors cursor-pointer'
              strokeWidth={1.5}
            />
          </div>
          <span className='text-[#F8F8F8]/50 text-sm tracking-widest uppercase font-light'>
            Core Tools
          </span>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
