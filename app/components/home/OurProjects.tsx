'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeIn } from '@/lib/motion'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

const projects = [
  {
    title: 'bow4bass.com',
    image: '/projects/bow4bass.webp',
    href: 'https://bow4bass.com',
    objectPosition: 'left center',
  },
  {
    title: 'ioana-illustrations.eu',
    image: '/projects/ioana-illustrations.webp',
    href: 'https://ioana-illustrations.eu',
    objectPosition: '20% center',
  },
  {
    title: 'miestnacirkev.sk',
    image: '/projects/miestnacirkev.webp',
    href: 'https://miestnacirkev.sk',
    objectPosition: '27% center',
  },
  {
    title: 'kvalitnamontaz.sk',
    image: '/projects/kvalitnamontaz.webp',
    href: 'https://kvalitnamontaz.sk',
  },
  {
    title: 'cestazivota.sk',
    image: '/projects/cestazivota.webp',
    href: 'https://cestazivota.sk',
  },
  {
    title: 'prud.sk',
    image: '/projects/prud.webp',
    href: 'https://prud.sk',
  },

  {
    title: 'michaldovala.sk',
    image: '/projects/michaldovala.webp',
    href: 'https://michaldovala.vercel.app',
  },
  {
    title: 'librosophia.sk',
    image: '/projects/librosophia.webp',
    href: 'https://librosophia.sk',
  },
  {
    title: 'fyziology.sk',
    image: '/projects/fyziology.webp',
    href: 'https://fyziology.sk',
  },
]

// Desktop: 3 per slide (1 big + 2 small), Mobile: 2 per slide stacked
const desktopSlides: (typeof projects)[] = []
for (let i = 0; i < projects.length; i += 3) {
  desktopSlides.push(projects.slice(i, i + 3))
}
const mobileSlides: (typeof projects)[] = []
for (let i = 0; i < projects.length; i += 2) {
  mobileSlides.push(projects.slice(i, i + 2))
}

const ProjectCard = ({
  project,
  className,
  aspectClass,
  sizes,
}: {
  project: (typeof projects)[0]
  className?: string
  aspectClass: string
  sizes: string
}) => {
  const objPos = project.objectPosition || 'center top'
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden block h-full ${className || ''}`}
      style={{ borderRadius: '24px', border: '12px solid rgba(255,255,255,0.4)' }}
    >
      <div className={`relative ${aspectClass} overflow-hidden h-full`}>
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
          style={{ objectPosition: objPos }}
          sizes={sizes}
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-5">
          <span className="text-pictus-lime text-xs md:text-sm font-semibold uppercase tracking-widest">
            {project.title}
          </span>
        </div>
      </div>
    </a>
  )
}

const OurProjects = () => {
  const t = useTranslations('Home')
  const [current, setCurrent] = useState(0)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const slides = isDesktop ? desktopSlides : mobileSlides

  const prev = () => setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1))

  // Reset to 0 if current exceeds slides when switching
  const safeIndex = current >= slides.length ? 0 : current
  const slide = slides[safeIndex]

  return (
    <section id="projects" className="relative py-20 md:py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.1, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-12 md:mb-16"
        >
          <h2 className="font-brutal-milk text-pictus-white text-5xl md:text-7xl lg:text-8xl italic lowercase text-center">
            {t('ourProjectsTitle')}
          </h2>
        </motion.div>

        {/* Slider */}
        <div className="relative">
          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-pictus-onyx900/80 border border-white/10 flex items-center justify-center text-white hover:bg-pictus-lime/20 hover:border-pictus-lime/40 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-pictus-onyx900/80 border border-white/10 flex items-center justify-center text-white hover:bg-pictus-lime/20 hover:border-pictus-lime/40 transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide content: 1 big left + 2 small right */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5 lg:grid-rows-2"
            >
              {/* Large card — left, spans both rows */}
              {slide[0] && (
                <div className="lg:col-span-3 lg:row-span-2">
                  <ProjectCard
                    project={slide[0]}
                    aspectClass="aspect-[16/10] lg:aspect-auto"
                    className="lg:h-full"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </div>
              )}

              {/* Top-right card */}
              {slide[1] && (
                <div className="lg:col-span-2 lg:row-span-1">
                  <ProjectCard
                    project={slide[1]}
                    aspectClass="aspect-[16/10]"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              )}

              {/* Bottom-right card — only present on desktop slides */}
              {slide[2] && (
                <div className="lg:col-span-2 lg:row-span-1">
                  <ProjectCard
                    project={slide[2]}
                    aspectClass="aspect-[16/10]"
                    sizes="40vw"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-pictus-lime w-6' : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA button */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.3, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/contact"
            className="inline-block bg-gradient-to-r from-pictus-lime to-pictus-lime600 px-8 py-3 rounded-full text-lg font-normal text-pictus-black hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all transform hover:scale-105 shadow-lg hover:shadow-pictus-lime/50"
          >
            {t('getInTouchButton')}
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default OurProjects
