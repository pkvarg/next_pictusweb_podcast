'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motion'
import { Monitor, LayoutPanelLeft, Clapperboard, Lightbulb } from 'lucide-react'

const services = [
  {
    label: 'Tvorba webov',
    icon: Monitor,
    description: 'Moderna webova stranka, optimalizovana pre dizajn, priehladnost a rast vasho biznisu.',
  },
  {
    label: 'Redizajn webov',
    icon: LayoutPanelLeft,
    description: 'Premena zastaraleho webu na moderny, uzivatelsky privetive riesenie any vizualny.',
  },
  {
    label: 'AI media',
    icon: Clapperboard,
    description: 'AI podcasty a digitalny obsah pre modernu komunikaciu a vizualitu.',
  },
  {
    label: 'AI riesenia',
    icon: Lightbulb,
    description: 'Integracia AI nastrojov a automatizacie do podnikovych procesov.',
  },
]

const Services = () => {
  return (
    <section
      className="relative py-10 md:py-16 px-6 md:px-12"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <motion.div
        variants={staggerContainer(0.1, 0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <motion.div
              key={service.label}
              variants={fadeIn('up', 'tween', index * 0.08, 0.5)}
              className="group relative flex flex-col items-center gap-3 py-6 md:py-8 px-5 border border-white/10 hover:border-pictus-lime/40 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg transition-all duration-300 cursor-pointer"
            >
              <Icon
                className="w-9 h-9 text-pictus-lime group-hover:text-pictus-lime/80 transition-colors duration-300"
                strokeWidth={1.5}
              />
              <h3 className="text-[#F8F8F8] text-xs md:text-sm font-semibold tracking-widest uppercase text-center group-hover:text-pictus-lime transition-colors duration-300">
                {service.label}
              </h3>
              <p className="text-[#F8F8F8]/40 text-[11px] md:text-xs font-light leading-relaxed text-center">
                {service.description}
              </p>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}

export default Services
