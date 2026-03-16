'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motion'
import Image from 'next/image'

const services = [
  {
    label: 'Tvorba webov',
    icon: '/icons/service-web.svg',
    description: 'Moderné webové stránky navrhnuté pre rýchlosť, prehľadnosť a rast vášho biznisu.',
  },
  {
    label: 'Redizajn webov',
    icon: '/icons/service-redesign.svg',
    description: 'Premena zastaraného webu na moderný, výkonný a vizuálne silný nástroj.',
  },
  {
    label: 'AI média',
    icon: '/icons/service-media.svg',
    description: 'AI podcasty a digitálny obsah pre modernú komunikáciu značiek.',
  },
  {
    label: 'AI riešenia',
    icon: '/icons/service-ai.svg',
    description: 'Inteligentné AI nástroje a automatizácie pre efektívnejšie procesy.',
  },
]

const Services = () => {
  return (
    <section className="relative py-12 md:py-20 px-6 md:px-12">
      {/* Cards grid with glow */}
      <div className="relative max-w-7xl mx-auto">
        {/* Green glow — matches Figma: ellipse, lime gradient, 150px blur, 64% opacity */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[10%]"
          style={{
            width: '320px',
            height: '210px',
            borderRadius: '50%',
            filter: 'blur(150px)',
            opacity: 0.64,
            background:
              'linear-gradient(135deg, rgba(182,224,54,0.75) 0%, rgba(99,121,29,0.87) 100%)',
          }}
        />

        <motion.div
          variants={staggerContainer(0.12, 0.15)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="relative grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.label}
              variants={fadeIn('up', 'tween', index * 0.08, 0.55)}
              className="group relative flex flex-col items-center text-center gap-5 py-10 md:py-12 px-5 md:px-6 overflow-hidden transition-all duration-300"
              style={{
                borderRadius: '35px',
                border: '1px solid rgba(23, 24, 22, 0.8)',
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(230,230,230,0.024) 100%), rgba(23, 24, 22, 0.7)',
              }}
            >
              {/* Icon */}
              <Image
                src={service.icon}
                alt={service.label}
                width={54}
                height={54}
                className="w-[46px] h-[46px] md:w-[54px] md:h-[54px] shrink-0"
              />

              {/* Title — Brutal Milk No 2, 500 weight, 24px */}
              <h3
                className="text-white text-lg md:text-[24px] leading-tight"
                style={{
                  fontFamily: '"Brutal Milk", sans-serif',
                  fontWeight: 500,
                  letterSpacing: '1.2px',
                }}
              >
                {service.label}
              </h3>

              {/* Description — Satoshi 300, 18px, white 80% */}
              <p className="text-white/80 text-[14px] md:text-[16px] font-light leading-snug max-w-[265px]">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Services
