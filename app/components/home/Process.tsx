'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react'
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

const PAD = 4 // padding so strokes don't clip at edges

function buildPath(W: number, totalH: number, stepCount: number) {
  const pillH = totalH / stepCount
  const r = Math.min(70, pillH * 0.4)
  const leftEdge = PAD
  const rightEdge = W - PAD
  const midLeft = W * 0.22
  const midRight = W * 0.78

  let d = ''

  for (let i = 0; i < stepCount; i++) {
    const y = PAD + i * pillH
    const yb = y + pillH
    const isRight = i % 2 === 0

    if (isRight) {
      if (i === 0) d += `M ${midLeft} ${y}`
      d += ` L ${rightEdge - r} ${y}`
      d += ` A ${r} ${r} 0 0 1 ${rightEdge} ${y + r}`
      d += ` L ${rightEdge} ${yb - r}`
      d += ` A ${r} ${r} 0 0 1 ${rightEdge - r} ${yb}`
      if (i < stepCount - 1) {
        d += ` L ${leftEdge + r} ${yb}`
      } else {
        // Last right pill: bottom line ends at midLeft
        d += ` L ${midLeft} ${yb}`
      }
    } else {
      d += ` L ${leftEdge + r} ${y}`
      d += ` A ${r} ${r} 0 0 0 ${leftEdge} ${y + r}`
      d += ` L ${leftEdge} ${yb - r}`
      d += ` A ${r} ${r} 0 0 0 ${leftEdge + r} ${yb}`
      if (i < stepCount - 1) {
        d += ` L ${rightEdge - r} ${yb}`
      } else {
        // Last left pill: close the bottom fully
        d += ` L ${midRight - r} ${yb}`
        d += ` A ${r} ${r} 0 0 0 ${midRight} ${yb - r}`
      }
    }
  }

  return d
}

const Process = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const greenRef = useRef<SVGPathElement>(null)
  const [svgData, setSvgData] = useState({ path: '', w: 0, h: 0 })
  const [pathLen, setPathLen] = useState(0)

  const measure = useCallback(() => {
    const el = stepsRef.current
    if (!el) return
    const w = el.offsetWidth
    const h = el.offsetHeight
    const svgH = h + PAD * 2 // extra space for stroke at top and bottom
    setSvgData({ path: buildPath(w, h, steps.length), w, h: svgH })
  }, [])

  useEffect(() => {
    const timer = setTimeout(measure, 200)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(timer); window.removeEventListener('resize', measure) }
  }, [measure])

  // Once path renders, measure its length and set up scroll
  useEffect(() => {
    const green = greenRef.current
    if (!green || !svgData.path) return

    const len = green.getTotalLength()
    setPathLen(len)

    // The green path starts fully hidden (dashoffset = length)
    green.style.strokeDasharray = `${len}`
    green.style.strokeDashoffset = `${len}`

    const onScroll = () => {
      const stepsEl = stepsRef.current
      if (!stepsEl) return

      const rect = stepsEl.getBoundingClientRect()
      const wH = window.innerHeight
      const scrollRange = rect.height + wH - wH * 0.4
      const scrolled = wH - rect.top
      const progress = Math.min(1, Math.max(0, scrolled / scrollRange))

      green.style.strokeDashoffset = `${len * (1 - progress)}`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [svgData.path])

  const stepH = svgData.h ? svgData.h / steps.length : 180

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
      <div className="max-w-5xl mx-auto">
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

        <div className="relative">
          {svgData.path && (
            <svg
              className="hidden md:block absolute top-0 left-0 pointer-events-none"
              width={svgData.w}
              height={svgData.h}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              shapeRendering="geometricPrecision"
            >
              {/*
                Two identical paths, same strokeWidth.
                White is always fully visible.
                Green draws on top as user scrolls — same width, so it
                perfectly covers the white portion beneath it.
                Both use the page background color as a "knockout" trick:
                we paint the green with full opacity over the white.
              */}
              <path
                d={svgData.path}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
                fill="none"
              />
              <path
                ref={greenRef}
                d={svgData.path}
                stroke="#B6E036"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          )}

          <div ref={stepsRef} data-steps className="relative flex flex-col">
            {steps.map((step, index) => {
              const isRight = index % 2 === 0
              return (
                <motion.div
                  key={step.number}
                  variants={fadeIn(isRight ? 'left' : 'right', 'tween', index * 0.1, 0.5)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  className={`flex items-center ${
                    isRight
                      ? 'justify-center md:justify-end md:pr-[8%]'
                      : 'justify-center md:justify-start md:pl-[8%]'
                  }`}
                  style={{ minHeight: `${Math.max(stepH, 160)}px` }}
                >
                  <div className="max-w-[380px] py-6">
                    <h3 className="text-[#F8F8F8] text-lg md:text-xl font-semibold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#F8F8F8]/50 text-sm md:text-[15px] font-light leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

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
