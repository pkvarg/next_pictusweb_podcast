'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const services = [
  { labelKey: 'serviceWebLabel', descKey: 'serviceWebDesc', icon: '/icons/service-web.svg' },
  { labelKey: 'serviceRedesignLabel', descKey: 'serviceRedesignDesc', icon: '/icons/service-redesign.svg' },
  { labelKey: 'serviceMediaLabel', descKey: 'serviceMediaDesc', icon: '/icons/service-media.svg' },
  { labelKey: 'serviceAILabel', descKey: 'serviceAIDesc', icon: '/icons/service-ai.svg' },
]

const Services = () => {
  const t = useTranslations('Home')
  return (
    <section id="services" className="relative py-12 md:py-20 px-6 md:px-12">
      {/* Cards grid with glow */}
      <div className="relative max-w-7xl mx-auto">
        {/* Green glow from Figma */}
        <Image
          src="/light-1.webp"
          alt=""
          width={610}
          height={503}
          aria-hidden
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[10%] opacity-64"
        />

        <motion.div
          variants={staggerContainer(0.12, 0.15)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="relative grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.labelKey}
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
                alt={t(service.labelKey)}
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
                {t(service.labelKey)}
              </h3>

              {/* Description — Satoshi 300, 18px, white 80% */}
              <p className="text-white/80 text-sm md:text-base font-light leading-snug max-w-[265px]">
                {t(service.descKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Services
