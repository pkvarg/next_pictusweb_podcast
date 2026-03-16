'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'
import Image from 'next/image'
import { Figma, Atom, FileCode2, Triangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import LanguageBar from '../LanguageBar'

const Hero = () => {
  const t = useTranslations('Home')

  return (
    <section className="relative isolate min-h-screen overflow-hidden flex flex-col p-6 md:p-12 justify-between">
      {/* Top Navigation */}
      <header
        className="flex w-full z-30 items-center justify-between"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        <div className="flex items-center gap-16 md:gap-24">
          <Link href="/" className="text-[#F8F8F8] text-[30px] tracking-tight font-normal">
            Logo
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            <Link
              href="/fleetsync"
              className="text-[#F8F8F8]/70 hover:text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light transition-colors"
            >
              FleetSync
            </Link>
            <Link
              href="/#projects"
              className="text-[#F8F8F8]/70 hover:text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light transition-colors"
            >
              Our Work
            </Link>
            <Link
              href="/podcasts"
              className="text-[#F8F8F8]/70 hover:text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light transition-colors"
            >
              Podcasts
            </Link>
            <Link
              href="/contact"
              className="text-[#F8F8F8]/70 hover:text-[#F8F8F8] text-[14px] tracking-widest uppercase font-light transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
        <LanguageBar />
      </header>

      {/* Testing banner */}
      <div className="relative z-30 mt-4 mx-auto w-fit px-6 py-2.5 rounded-full border border-red-500/50 bg-red-600/20 backdrop-blur-sm">
        <span className="text-red-400 text-[17px] tracking-wide">
          !! {t('testingBanner')}{' '}
          <a
            href="https://www.pictusweb.sk"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-red-300 hover:text-white transition-colors font-medium"
          >
            pictusweb.sk
          </a>{' '}
          !!
        </span>
      </div>

      {/* Giant background text */}
      <div
        className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none overflow-hidden w-full -translate-y-[16vh]"
        aria-hidden="true"
      >
        <h1 className="font-brutal-milk text-[11vw] leading-[0.85] font-bold text-[#F8F8F8]/90 tracking-[0.04em] whitespace-nowrap mt-8 scale-y-[1.7] origin-center">
          PICTUS<span className="ml-[10vw]">WORLD</span>
        </h1>
      </div>

      {/* Centered mascot */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none mt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="animate-float"
        >
          <Image
            src="/hero-mascot.png"
            alt="Pictus Mascot"
            width={800}
            height={800}
            priority
            className="h-[60vh] md:h-[75vh] w-auto max-w-none object-contain drop-shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Bottom content area */}
      <motion.div
        variants={fadeIn('up', 'tween', 0.2, 0.8)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="flex flex-col md:flex-row justify-between items-end w-full z-30 gap-12 mt-auto pb-4"
      >
        {/* Left: description */}
        <div className="max-w-[420px] w-full">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-px w-10 bg-white/40" />
            <span className="text-[#F8F8F8]/80 text-sm tracking-widest uppercase font-light">
              Creative Studio
            </span>
          </div>
          <p className="text-[#F8F8F8] text-lg md:text-xl font-light leading-relaxed opacity-90">
            Crafting intuitive digital ecosystems and brand experiences for the next generation of
            creative growth.
          </p>
        </div>

        {/* Right: stack icons */}
        <div className="flex flex-col items-end gap-6 w-full md:w-auto">
          <div className="flex text-[#F8F8F8]/80 gap-x-6 gap-y-6 items-center">
            <Figma
              className="w-6 h-6 hover:text-white transition-colors cursor-pointer"
              strokeWidth={1.5}
            />
            <Atom
              className="w-6 h-6 hover:text-white transition-colors cursor-pointer"
              strokeWidth={1.5}
            />
            <FileCode2
              className="w-6 h-6 hover:text-white transition-colors cursor-pointer"
              strokeWidth={1.5}
            />
            <Triangle
              className="w-6 h-6 hover:text-white transition-colors cursor-pointer"
              strokeWidth={1.5}
            />
          </div>
          <span className="text-[#F8F8F8]/50 text-sm tracking-widest uppercase font-light">
            Core Tools
          </span>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
