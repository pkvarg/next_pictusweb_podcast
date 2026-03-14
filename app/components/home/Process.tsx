'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'

const steps = [
  {
    number: '01',
    title: 'Pochopenie projektu',
    description:
      'Zacneme tym, ze ti naozaj porozumieme. Tvoj biznis, cielova skupina, ciele -- vsetko premyslime este pred prvym pixelom.',
  },
  {
    number: '02',
    title: 'Struktura a obsah',
    description:
      'Navrhneme informacnu architekturu a obsah, ktory dava zmysel. Kazda stranka ma jasny ucel a ciel.',
  },
  {
    number: '03',
    title: 'Dizajn',
    description:
      'Vytvarame vizualnu identitu, ktora odlisuje. Moderny, cisty dizajn s dorazom na pouzitelnost a konverzie.',
  },
  {
    number: '04',
    title: 'Vyvoj',
    description:
      'Kodujeme s najnovsimi technologiami. Rychle nacitanie, SEO optimalizacia a bezpecnost su samozrejmostou.',
  },
  {
    number: '05',
    title: 'Dodavka',
    description:
      'Spustime, otestujeme a odovzdame. Ale tu to nekonci -- postarame sa o udrzbu a rast tvojho webu.',
  },
]

const Process = () => {
  return (
    <section
      className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.1, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-6"
        >
          <h2 className="font-brutal-milk text-[#F8F8F8] text-3xl md:text-5xl lg:text-6xl leading-tight">
            Tvoj web bude vznikat takto
          </h2>
        </motion.div>
        <motion.p
          variants={fadeIn('up', 'tween', 0.2, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-[#F8F8F8]/60 text-base md:text-lg font-light leading-relaxed max-w-2xl mb-16 md:mb-24"
        >
          Overeny proces, ktory premeni tvoju viziu na funkcny a esteticky web.
          Kazdy krok ma jasny ciel a transparentny vystup.
        </motion.p>

        {/* Steps with vertical line */}
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-px" />

          {steps.map((step, index) => {
            const isLeft = index % 2 === 0

            return (
              <motion.div
                key={step.number}
                variants={fadeIn(
                  isLeft ? 'right' : 'left',
                  'tween',
                  index * 0.1,
                  0.5
                )}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className={`relative flex items-start mb-16 last:mb-0 ${
                  isLeft
                    ? 'md:flex-row md:text-right'
                    : 'md:flex-row-reverse md:text-left'
                }`}
              >
                {/* Content */}
                <div
                  className={`ml-16 md:ml-0 md:w-[calc(50%-40px)] ${
                    isLeft ? 'md:pr-0 md:ml-auto md:mr-[40px]' : 'md:pl-0 md:mr-auto md:ml-[40px]'
                  }`}
                >
                  <span className="text-pictus-lime text-sm font-mono tracking-widest">
                    {step.number}
                  </span>
                  <h3 className="text-[#F8F8F8] text-xl md:text-2xl font-medium mt-1 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#F8F8F8]/50 text-sm md:text-base font-light leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Dot on the line */}
                <div className="absolute left-6 md:left-1/2 top-1 w-3 h-3 -translate-x-1/2 rounded-full bg-pictus-lime/80 border-2 border-[#141511]" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Process
