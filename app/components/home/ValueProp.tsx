'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'
import { Link } from '@/i18n/routing'

const ValueProp = () => {
  return (
    <section
      className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 70% 50%, rgba(182,224,54,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
        {/* Left: Text */}
        <motion.div
          variants={fadeIn('right', 'tween', 0.1, 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex-1"
        >
          <h2 className="font-brutal-milk text-[#F8F8F8] text-3xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Promyslene weby bez zbytocneho chaosu
          </h2>
          <p className="text-[#F8F8F8]/70 text-base md:text-lg font-light leading-relaxed max-w-xl mb-10">
            Staviame weby, ktore su jasne premyslene od prveho kliknutia.
            Ziadne zbytocne kolecka, ziadne chaoticky dizajn. Len cista
            struktura, moderna technologia a vysledky, ktore sa daju merat.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-pictus-lime text-[#141511] px-8 py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-pictus-lime/90 transition-colors duration-200"
          >
            Porozpravajme sa
          </Link>
        </motion.div>

        {/* Right: Decorative element */}
        <motion.div
          variants={fadeIn('left', 'tween', 0.3, 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex-1 flex justify-center"
        >
          <div className="relative w-full max-w-md aspect-square">
            {/* Abstract geometric decoration */}
            <div className="absolute inset-8 border border-pictus-lime/20 rotate-3" />
            <div className="absolute inset-4 border border-white/5 -rotate-2" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-brutal-milk text-[120px] md:text-[160px] text-pictus-lime/10 select-none leading-none">
                PW
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ValueProp
