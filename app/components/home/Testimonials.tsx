'use client'
import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'
import Image from 'next/image'

const featured = {
  name: 'Tomas',
  role: 'CEO, DVL Coaching',
  image: '/tomas1.webp',
  quote:
    'Spolupracovat s Pictus bola jedna z najlepsich rozhodnuti pre nas biznis. Profesionalny pristup, rychle dodanie a vysledok, ktory prekonava ocakavania.',
}

const testimonials = [
  {
    name: 'Michal',
    role: 'Founder, Prud Records',
    image: '/michal.webp',
    quote:
      'Nas web konecne vyzera tak, ako sme si to predstavovali. Rychly, moderny a funkcny.',
  },
  {
    name: 'Vlado',
    role: 'Managing Director',
    image: '/vlado.webp',
    quote:
      'Perfektna komunikacia od zaciatku do konca. Vsetko bolo dodane vcas a v skvelej kvalite.',
  },
  {
    name: 'Leo',
    role: 'Creative Director',
    image: '/leo1.webp',
    quote:
      'Kreativny pristup k rieseniu problemov. Vzdy prisli s napady, na ktore by sme sami neprisli.',
  },
  {
    name: 'Samuel',
    role: 'Entrepreneur',
    image: '/sam1.webp',
    quote:
      'Od prveho stretnutia sme vedeli, ze sme v dobrych rukach. Profesionali na svojom mieste.',
  },
]

const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section
      className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section title */}
        <motion.h2
          variants={fadeIn('up', 'tween', 0.1, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="font-brutal-milk text-[#F8F8F8] text-3xl md:text-5xl lg:text-6xl mb-16 md:mb-20"
        >
          Co hovoria nasi klienti
        </motion.h2>

        {/* Featured testimonial */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.2, 0.6)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-16 md:mb-24 p-8 md:p-12 border border-white/10"
        >
          <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-full overflow-hidden">
            <Image
              src={featured.image}
              alt={featured.name}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <div>
            <blockquote className="text-[#F8F8F8]/90 text-lg md:text-xl lg:text-2xl font-light leading-relaxed italic mb-6">
              &ldquo;{featured.quote}&rdquo;
            </blockquote>
            <div>
              <span className="text-pictus-lime text-sm font-medium tracking-wide">
                {featured.name}
              </span>
              <span className="text-[#F8F8F8]/40 text-sm ml-3">
                {featured.role}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Horizontal scroll of smaller cards */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.3, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="flex-shrink-0 w-72 md:w-80 p-6 border border-white/10 hover:border-pictus-lime/30 transition-colors duration-300"
              >
                <p className="text-[#F8F8F8]/70 text-sm font-light leading-relaxed mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <div className="text-[#F8F8F8] text-sm font-medium">
                      {item.name}
                    </div>
                    <div className="text-[#F8F8F8]/40 text-xs">
                      {item.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
