'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

const testimonials = [
  { name: 'Ioana Mindrila', role: 'Designer - IoanaM', image: '/ionuca1.webp', quoteKey: 'testimonial1' },
  { name: 'Tomáš Dovala', role: 'CEO - Dovala Construction', image: '/tomas1.webp', quoteKey: 'testimonial2' },
  { name: 'Leo Grman', role: 'Manager - prud.sk', image: '/leo1.webp', quoteKey: 'testimonial3' },
  { name: 'Michal Dovala', roleKey: 'testimonial4Role', image: '/michal.webp', quoteKey: 'testimonial4' },
  { name: 'Samuel Koriťák', roleKey: 'testimonial5Role', image: '/sam1.webp', quoteKey: 'testimonial5' },
  { name: 'Vladimír Chovanec', roleKey: 'testimonial6Role', image: '/vlado.webp', quoteKey: 'testimonial6' },
  { name: 'Ján Prievozník', roleKey: 'testimonial7Role', image: '/jp-review.webp', quoteKey: 'testimonial7' },
]

const cardStyle = {
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(230,230,230,0.024) 100%), rgba(23, 24, 22, 0.7)',
  border: '1px solid rgba(23, 24, 22, 0.8)',
  borderRadius: '35px',
}

const Testimonials = () => {
  const t = useTranslations('Home')
  return (
    <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header: title left, description right */}
        <motion.div
          variants={staggerContainer(0.15, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col gap-6 mb-16 md:mb-20"
        >
          <motion.h2
            variants={fadeIn('up', 'tween', 0.1, 0.5)}
            className="font-brutal-milk text-white text-3xl md:text-5xl lg:text-6xl"
          >
            {t('testimonialsTitle')}
          </motion.h2>

          <motion.p
            variants={fadeIn('up', 'tween', 0.2, 0.5)}
            className="text-[#F8F8F8] text-lg md:text-xl font-light leading-relaxed max-w-[445px] md:self-end"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            {t('testimonialsSubtitle')}
          </motion.p>
        </motion.div>

        {/* Testimonial cards — first row of 3, second row of 3 */}
        <motion.div
          variants={staggerContainer(0.12, 0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              variants={fadeIn('up', 'tween', 0.1 * index, 0.5)}
              style={cardStyle}
              className="flex flex-col justify-between p-6 md:p-8"
            >
              <p className="text-white/80 text-sm md:text-base font-light leading-relaxed mb-8">
                &ldquo;{t(item.quoteKey)}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <div className="text-pictus-lime text-sm font-semibold">
                    {item.name}
                  </div>
                  <div className="text-white/50 text-xs mt-0.5">
                    {item.roleKey ? t(item.roleKey) : item.role}
                  </div>
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
