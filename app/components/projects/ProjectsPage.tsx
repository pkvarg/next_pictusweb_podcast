'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motion'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'
import { useTranslations } from 'next-intl'

const projects = [
  {
    title: 'bow4bass.com',
    image: '/projects/bow4bass.png',
    href: 'https://bow4bass.com',
    objectPosition: 'left center',
    descriptionKey: 'projectBow4bassDesc',
  },
  {
    title: 'ioana-illustrations.eu',
    image: '/projects/ioana-illustrations.png',
    href: 'https://ioana-illustrations.eu',
    objectPosition: '20% center',
    descriptionKey: 'projectIoanaDesc',
  },
  {
    title: 'miestnacirkev.sk',
    image: '/projects/miestnacirkev.png',
    href: 'https://miestnacirkev.sk',
    objectPosition: '27% center',
    descriptionKey: 'projectMiestnacirkevDesc',
  },
  {
    title: 'kvalitnamontaz.sk',
    image: '/projects/kvalitnamontaz.png',
    href: 'https://kvalitnamontaz.sk',
    descriptionKey: 'projectKvalitnamontazDesc',
  },
  {
    title: 'katolickaviera.sk',
    image: '/projects/katolickaviera.png',
    href: 'https://katolickaviera.sk',
    descriptionKey: 'projectKatolickavieraDesc',
  },
  {
    title: 'prud.sk',
    image: '/projects/prud.png',
    href: 'https://prud.sk',
    descriptionKey: 'projectPrudDesc',
  },
  {
    title: 'michaldovala.sk',
    image: '/projects/michaldovala.png',
    href: 'https://michaldovala.vercel.app',
    descriptionKey: 'projectMichaldovalaDesc',
  },
  {
    title: 'librosophia.sk',
    image: '/projects/librosophia.webp',
    href: 'https://librosophia.sk',
    descriptionKey: 'projectLibrosophiaDesc',
  },
]

const glassCard = {
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(230,230,230,0.02) 100%), rgba(23, 24, 22, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '24px',
}

const fontSystem = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const ProjectsPage = () => {
  const t = useTranslations('Home')

  return (
    <div className="min-h-screen bg-[#161616] text-white relative">
      {/* Starfield */}
      <div className="fixed inset-0 z-0 pointer-events-none stars-small" />
      <div className="fixed inset-0 z-0 pointer-events-none stars-medium" />
      <div className="fixed inset-0 z-0 pointer-events-none stars-large" />

      <div className="relative z-10">
        <PagesHeader />

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-12 md:pt-32 md:pb-16">
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            animate="show"
            className="text-center"
          >
            <motion.h1
              variants={fadeIn('up', 'tween', 0.1, 0.6)}
              className="font-brutal-milk text-5xl lg:text-7xl mb-6 leading-tight lowercase italic"
            >
              {t('navbarProjects')}
            </motion.h1>

            <motion.p
              variants={fadeIn('up', 'tween', 0.2, 0.6)}
              className="text-lg md:text-xl text-[#F8F8F8]/50 max-w-2xl mx-auto font-light"
              style={fontSystem}
            >
              {t('projectsSubtitle')}
            </motion.p>

            <motion.div
              variants={fadeIn('up', 'tween', 0.3, 0.6)}
              className="h-px w-16 bg-pictus-lime/40 mx-auto mt-8"
            />
          </motion.div>
        </section>

        {/* Projects Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <motion.div
            variants={staggerContainer(0.1, 0.15)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
            className="flex flex-col gap-8"
          >
            {projects.map((project, index) => {
              const isEven = index % 2 === 0

              return (
                <motion.a
                  key={project.title}
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeIn(isEven ? 'right' : 'left', 'tween', 0.1, 0.6)}
                  style={glassCard}
                  className="group grid grid-cols-1 lg:grid-cols-2 overflow-hidden hover:border-pictus-lime/15 transition-all duration-500"
                >
                  {/* Image — left on even, right on odd */}
                  <div
                    className={`relative aspect-[16/10] lg:aspect-auto lg:min-h-[320px] overflow-hidden ${
                      !isEven ? 'lg:order-2' : ''
                    }`}
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                      style={{ objectPosition: project.objectPosition || 'center top' }}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all duration-500" />
                  </div>

                  {/* Content */}
                  <div
                    className={`flex flex-col justify-center p-8 md:p-12 ${
                      !isEven ? 'lg:order-1' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <h2
                        className="font-brutal-milk text-2xl md:text-3xl text-white group-hover:text-pictus-lime transition-colors duration-300"
                        style={{ fontWeight: 500 }}
                      >
                        {project.title}
                      </h2>
                      <ExternalLink className="w-4 h-4 text-[#F8F8F8]/20 group-hover:text-pictus-lime/60 transition-colors duration-300 flex-shrink-0" />
                    </div>

                    <p
                      className="text-[#F8F8F8]/50 text-[15px] font-light leading-relaxed mb-6 max-w-md"
                      style={fontSystem}
                    >
                      {t(project.descriptionKey)}
                    </p>

                  </div>
                </motion.a>
              )
            })}
          </motion.div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 px-6">
          <motion.div
            variants={fadeIn('up', 'tween', 0.1, 0.6)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-brutal-milk text-3xl md:text-5xl text-white mb-10 leading-tight lowercase">
              {t('callToActionTitle') || 'poďme niečo vymyslieť!'}
            </h2>
            <a
              href="/contact"
              className="inline-block bg-gradient-to-r from-pictus-lime to-pictus-lime600 px-10 py-3.5 rounded-full text-base font-medium text-pictus-black hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pictus-lime/30"
              style={fontSystem}
            >
              {t('getInTouchButton')}
            </a>
          </motion.div>
        </section>

        <Footer />
      </div>
    </div>
  )
}

export default ProjectsPage
