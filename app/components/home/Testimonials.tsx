'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motion'
import Image from 'next/image'

const testimonials = [
  {
    name: 'Ioana Mindrila',
    role: 'Designer - IoanaM',
    image: '/ionuca1.webp',
    quote:
      'Peter mi dokázal vytvoriť web profesionálne, promptne, kvalitne a za rozumnú cenu. S výsledkom som veľmi spokojná. Ďakujem Peter ❤️.',
  },
  {
    name: 'Tomáš Dovala',
    role: 'CEO - Dovala Construction',
    image: '/tomas1.webp',
    quote:
      'Spolupráca s Petrom je výborná, skvelá komunikácia a výsledok. Práca ho baví, robí ju poctivo a dôkladne. Určite s ním počítam pri svojich ďalších projektoch.',
  },
  {
    name: 'Leo Grman',
    role: 'Manager - prud.sk',
    image: '/leo1.webp',
    quote:
      'S Petrom spolupracujem už dlhé roky v rôznych oblastiach a vždy ma poteší jeho priateľský prístup a ochota pomôcť. Ďakujem.',
  },
  {
    name: 'Michal Dovala',
    role: 'Realitný maklér - michaldovala.sk',
    image: '/michal.webp',
    quote:
      'Pokiaľ hľadáte niekoho spoľahlivého a šikovného, Peter je Váš človek. Som veľmi spokojný s jeho prácou a odporúčam spoluprácu s ním.',
  },
  {
    name: 'Samuel Koriťák',
    role: 'Autor - cestazivota.sk',
    image: '/sam1.webp',
    quote:
      'Výborná spolupráca, ľahké pochopenie mojich požiadaviek a pripomienok, flexibilita pri možnostiach, ktoré boli predmetom môjho rozhodnutia.',
  },
  {
    name: 'Vladimír Chovanec',
    role: 'Fyzioterapeut - fyziology.sk',
    image: '/vlado.webp',
    quote:
      'Pictusweb som vyhľadal kvôli naštýlovaniu grafického dizajnu pre môj web. Spoluprácu hodnotím veľmi pozitívne, pán bol veľmi príjemný, ochotný a rýchly. Určite doporučujem.',
  },
]

const cardStyle = {
  background:
    'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(230,230,230,0.024) 100%), rgba(23, 24, 22, 0.7)',
  border: '1px solid rgba(23, 24, 22, 0.8)',
  borderRadius: '35px',
}

const Testimonials = () => {
  return (
    <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header: title left, description right */}
        <motion.div
          variants={staggerContainer(0.15, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-12 mb-16 md:mb-20"
        >
          <motion.h2
            variants={fadeIn('up', 'tween', 0.1, 0.5)}
            className="font-brutal-milk text-white text-3xl md:text-5xl lg:text-6xl lg:max-w-[50%] shrink-0"
          >
            Čo hovoria naši klienti
          </motion.h2>

          <motion.p
            variants={fadeIn('up', 'tween', 0.2, 0.5)}
            className="text-white/60 text-sm md:text-base font-light leading-relaxed lg:max-w-md lg:pt-2"
          >
            Každý projekt je spolupráca. Spätná väzba od klientov nám pomáha
            rásť a robiť to, čo robíme, ešte lepšie.
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
              <p className="text-white/80 text-sm md:text-[15px] font-light leading-relaxed mb-8">
                &ldquo;{item.quote}&rdquo;
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
                    {item.role}
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
