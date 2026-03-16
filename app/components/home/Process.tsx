'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'
import { Link } from '@/i18n/routing'

const steps = [
  {
    number: '01',
    title: 'Pochopenie a analýza',
    description:
      'Najskôr spoznáme váš biznis, ciele a publikum. Vďaka tomu vieme navrhnúť správny smer celej stratégie, nie začínáme naslepo s dizajnom.',
  },
  {
    number: '02',
    title: 'Štruktúra a obsah',
    description:
      'Navrhneme logickú štruktúru webu a wireframy informácií. Drilujeme architektúru stránok, to všetko rôzne postupy, čo máme.',
  },
  {
    number: '03',
    title: 'Dizajn',
    description:
      'Vytvoríme vizuálny štýl, ktorý je čistý, estetický a pripojil formálneho creative. Dizajn sa raz je dokonalý, ale médium pre jasnosti a účinok.',
  },
  {
    number: '04',
    title: 'Vývoj',
    description:
      'Dizajn premeníme na rýchly, responsívny a technicky čistý web. Riešime výkon, mobilitu a individuálnu digitálnu použiteľnosť.',
  },
  {
    number: '05',
    title: 'Spustenie',
    description:
      'Po nasadení web spustíme a prepojíme na analytics a podklady. Výsledkom je digitálna prezentácia, ktorá reálne a funkčne posilní založenie.',
  },
]

/**
 * Generates an SVG path for a curved connector between two steps.
 * The curve goes from the bottom of one pill to the top of the next,
 * creating a smooth S-curve that follows the zigzag layout.
 */
function ConnectorCurve({
  fromRight,
  index,
}: {
  fromRight: boolean
  index: number
}) {
  // On mobile, render a simple vertical line segment
  // On desktop, render curved SVG paths between pills
  return (
    <div className="flex justify-center py-2 md:py-0">
      {/* Mobile: simple vertical connector */}
      <div className="block md:hidden w-px h-12 bg-white/10" />

      {/* Desktop: curved SVG connector */}
      <svg
        className="hidden md:block w-full h-24"
        viewBox="0 0 800 96"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={
            fromRight
              ? 'M 540 0 C 540 48, 260 48, 260 96'
              : 'M 260 0 C 260 48, 540 48, 540 96'
          }
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  )
}

const Process = () => {
  return (
    <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.1, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-6 text-center"
        >
          <h2 className="font-brutal-milk text-[#F8F8F8] text-3xl md:text-5xl leading-tight">
            Tvoj web bude vznikať takto
          </h2>
        </motion.div>

        <motion.p
          variants={fadeIn('up', 'tween', 0.2, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="text-[#F8F8F8]/60 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto text-center mb-16 md:mb-24"
        >
          Overený proces, ktorý premení tvoju víziu na funkčný a estetický web.
          Každý krok má jasný cieľ a transparentný výstup.
        </motion.p>

        {/* Steps — zigzag pill layout */}
        <div className="relative flex flex-col items-center">
          {steps.map((step, index) => {
            const isLeft = index % 2 === 0

            return (
              <React.Fragment key={step.number}>
                {/* Connector curve between steps */}
                {index > 0 && (
                  <ConnectorCurve
                    fromRight={index % 2 === 1}
                    index={index}
                  />
                )}

                {/* Step pill */}
                <motion.div
                  variants={fadeIn(
                    isLeft ? 'right' : 'left',
                    'tween',
                    index * 0.1,
                    0.5
                  )}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  className={`w-full flex ${
                    isLeft
                      ? 'justify-center md:justify-start'
                      : 'justify-center md:justify-end'
                  }`}
                >
                  <div className="w-full max-w-[540px] border border-white/15 rounded-full px-8 py-6 md:px-12 md:py-8 flex items-center gap-5 md:gap-7">
                    {/* Step number */}
                    <span className="text-white/20 text-3xl md:text-4xl font-bold font-mono shrink-0">
                      {step.number}
                    </span>

                    {/* Step content */}
                    <div className="min-w-0">
                      <h3 className="text-[#F8F8F8] text-lg md:text-xl font-semibold mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-[#F8F8F8]/50 text-sm md:text-[15px] font-light leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            )
          })}
        </div>

        {/* CTA Button */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.6, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex justify-center mt-16 md:mt-24"
        >
          <Link
            href="/contact"
            className="inline-block bg-gradient-to-r from-pictus-lime to-pictus-lime600 px-8 py-3 rounded-full text-lg font-normal text-pictus-black hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all transform hover:scale-105 shadow-lg hover:shadow-pictus-lime/50"
          >
            Mám záujem
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default Process
