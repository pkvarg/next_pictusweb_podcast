'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'
import { Link } from '@/i18n/routing'

const CallToAction = () => {
  return (
    <section className="relative py-32 md:py-40 px-6 md:px-12 overflow-hidden">
      <div className="relative max-w-4xl mx-auto text-center">
        <motion.h2
          variants={fadeIn('up', 'tween', 0.1, 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="font-brutal-milk text-white text-4xl md:text-6xl lg:text-8xl lowercase leading-tight mb-10 md:mb-14"
        >
          poďme niečo vymyslieť!
        </motion.h2>

        <motion.div
          variants={fadeIn('up', 'tween', 0.3, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
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

export default CallToAction
