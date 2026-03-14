'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { fadeIn, staggerContainer } from '@/lib/motion'
import Image from 'next/image'
import { Link } from '@/i18n/routing'

const projects = [
  { title: 'DVL Coaching', image: '/dvl-page.webp' },
  { title: 'Prud Records', image: '/prud-page.webp' },
  { title: 'Ioana Studio', image: '/ioana-page.webp' },
  { title: 'Pictus Web', image: '/pictusweb.webp' },
  { title: 'Bow4Bass', image: '/bow4bass.webp' },
]

const OurProjects = () => {
  return (
    <section
      id="projects"
      className="relative py-20 md:py-32 px-6 md:px-12"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section title */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.1, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16"
        >
          <h2 className="font-brutal-milk text-[#F8F8F8] text-4xl md:text-6xl lg:text-7xl italic font-bold lowercase">
            nase projekty
          </h2>
        </motion.div>

        {/* Projects grid */}
        <motion.div
          variants={staggerContainer(0.12, 0.15)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              variants={fadeIn('up', 'tween', index * 0.08, 0.5)}
              className={`group relative overflow-hidden cursor-pointer ${
                index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <div
                className={`relative overflow-hidden ${
                  index === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'
                }`}
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes={
                    index === 0
                      ? '(max-width: 768px) 100vw, 66vw'
                      : '(max-width: 768px) 100vw, 33vw'
                  }
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-500 flex items-end">
                  <div className="p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                    <h3 className="text-[#F8F8F8] text-xl md:text-2xl font-medium">
                      {project.title}
                    </h3>
                    <div className="h-0.5 w-8 bg-pictus-lime mt-2" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeIn('up', 'tween', 0.3, 0.5)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/contact"
            className="inline-block border border-pictus-lime text-pictus-lime px-8 py-3.5 text-sm font-semibold tracking-widest uppercase hover:bg-pictus-lime hover:text-[#141511] transition-all duration-300"
          >
            Chcem nieco podobne
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default OurProjects
