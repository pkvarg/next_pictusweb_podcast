'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'
import { Link } from '@/i18n/routing'
import Image from 'next/image'

const ValueProp = () => {
  return (
    <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
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
          <h2 className="font-brutal-milk text-[#F8F8F8] text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            Premyslené weby bez zbytočného chaosu
          </h2>
          <p className="text-[#F8F8F8]/80 text-base md:text-lg font-light leading-relaxed max-w-xl mb-10">
            Pomáhame firmám premeniť nápady na jasné a funkčné webové stránky.
            Spájame dizajn a štruktúru tak, aby web nielen dobre vyzeral, ale aj
            skutočne fungoval.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-gradient-to-r from-pictus-lime to-pictus-lime600 px-8 py-3 rounded-full text-lg font-normal text-pictus-black hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all transform hover:scale-105 shadow-lg hover:shadow-pictus-lime/50"
          >
            Mám záujem
          </Link>
        </motion.div>

        {/* Right: 3D Mascot */}
        <motion.div
          variants={fadeIn('left', 'tween', 0.3, 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex-1 flex justify-center"
        >
          <div className="relative w-full max-w-lg">
            <Image
              src="/mascot-laptop.png"
              alt="PictusWeb mascot on laptop"
              width={800}
              height={843}
              className="w-full h-auto object-contain"
              priority={false}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ValueProp
