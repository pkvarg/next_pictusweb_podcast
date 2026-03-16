'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motion'

const testimonials = [
  {
    name: 'Martin Kovač',
    role: 'Founder at Roadstage',
    quote:
      'Majster sme overiť. Za to najdôs overiť prechádzat naši biznis. Vrelo odporúčam všetkým, čo majú náš zakúpenám.',
  },
  {
    name: 'Lucia Benková',
    role: 'Marketing Manager at Studio Elena',
    quote:
      'Celý proces bol prekrásno jednoduchosť. Všetko bolo jasne vysvetlene a naradili sme, čo sa deje.',
  },
  {
    name: 'Tomáš Richter',
    role: 'Co-Founder at Vektra',
    quote:
      'Jasný štýl a dizajn. Pomáhli nám lepšie odpravúné odborť a nemáme všetko strastite povedaľ.',
  },
  {
    name: 'Peter Malík',
    role: 'Product Lead at Orbit Labs',
    quote:
      'Web pôsobí profesionálne a máme dobre pocity! mať by vás pustili dokument procesy.',
  },
]

const cardStyle = {
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(230,230,230,0.024) 100%), rgba(23, 24, 22, 0.7)',
  border: '1px solid rgba(23, 24, 22, 0.8)',
  borderRadius: '35px',
}

const Testimonials = () => {
  return (
    <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header: title left, description right */}
        <motion.div
          variants={staggerContainer(0.15, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-12 mb-16 md:mb-20"
        >
          <motion.h2
            variants={fadeIn('up', 'tween', 0.1, 0.5)}
            className="font-brutal-milk text-white text-3xl md:text-5xl lg:text-6xl lg:max-w-[50%] shrink-0"
          >
            Čo hovoria naši klienti
          </motion.h2>

          <motion.p
            variants={fadeIn('up', 'tween', 0.2, 0.5)}
            className="text-white/60 text-sm md:text-base font-light leading-relaxed lg:max-w-md lg:pt-2"
          >
            Každý projekt je spolupráca. Spätnú väzbu od klientov nám pomáha
            rásť a doplniť to, čo robíme, robiť ešte efektívnejšie, aby čo cieľ
            mali, a tvorimy sme pracovek.
          </motion.p>
        </motion.div>

        {/* Testimonial cards */}
        <motion.div
          variants={staggerContainer(0.12, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              variants={fadeIn('up', 'tween', 0.1 * index, 0.5)}
              style={cardStyle}
              className="flex flex-col justify-between p-6 md:p-8"
            >
              <p className="text-white/80 text-sm md:text-[15px] font-light leading-relaxed mb-8">
                &ldquo;{item.quote}&rdquo;
              </p>

              <div>
                <div className="text-pictus-lime text-sm font-semibold">
                  {item.name}
                </div>
                <div className="text-white/50 text-xs mt-0.5">
                  {item.role}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
