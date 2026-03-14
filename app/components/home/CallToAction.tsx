'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'
import { Link } from '@/i18n/routing'

const CallToAction = () => {
  return (
    <section
      className="relative py-24 md:py-40 px-6 md:px-12 overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Subtle gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(182,224,54,0.06) 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.h2
          variants={fadeIn('up', 'tween', 0.1, 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="font-brutal-milk text-[#F8F8F8] text-4xl md:text-6xl lg:text-8xl italic lowercase leading-tight mb-10 md:mb-14"
        >
          podme nieco vymyslet!
        </motion.h2>

        <motion.div
          variants={fadeIn('up', 'tween', 0.3, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Link
            href="/contact"
            className="inline-block bg-pictus-lime text-[#141511] px-10 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-pictus-lime/90 transition-colors duration-200"
          >
            Kontaktujte nas
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default CallToAction
