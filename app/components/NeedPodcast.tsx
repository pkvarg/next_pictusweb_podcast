'use client'
import React from 'react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'

const NeedPodcast = () => {
  const t = useTranslations('Home')

  return (
    <section className="relative py-20 md:py-28 px-6 overflow-hidden">
      <motion.div
        variants={fadeIn('up', 'tween', 0.1, 0.6)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="font-brutal-milk text-3xl md:text-5xl text-white mb-4 leading-tight">
          {t('podcastNeedPodcast')}
        </h2>
        <p
          className="text-[#F8F8F8]/50 text-lg font-light mb-10"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          {t('podcastNeedPodcastAction')}
        </p>
        <Link
          href="/contact"
          className="inline-block bg-gradient-to-r from-pictus-lime to-pictus-lime600 px-10 py-3.5 rounded-full text-base font-medium text-pictus-black hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pictus-lime/30"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          {t('getInTouchButton')}
        </Link>
      </motion.div>
    </section>
  )
}

export default NeedPodcast
