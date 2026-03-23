'use client'
import React from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { fadeIn } from '@/lib/motion'

const fontSystem = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const About = () => {
  const t = useTranslations('Home')
  return (
    <motion.div
      id="about"
      variants={fadeIn('up', 'tween', 0.1, 0.6)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="max-w-4xl mx-auto px-6 py-16"
    >
      <h2 className="font-brutal-milk text-3xl md:text-4xl text-center mb-12">
        {t('contactAboutTitle')}
      </h2>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-10 rounded-3xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(230,230,230,0.02) 100%), rgba(23, 24, 22, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          ...fontSystem,
        }}
      >
        <div className="space-y-2 text-[#F8F8F8]/60 text-[15px] font-light">
          <p className="text-white font-medium text-base mb-3">Pictusweb.s.r.o.</p>
          <p>Nábrežná 42</p>
          <p>Nové Zámky</p>
          <p>940 02</p>
          <p>{t('contactAboutSR')}</p>
          <p className="pt-2">+421 948 024 638</p>
          <p>IČO: 54631068</p>
          <p>DIČ: 2121741424</p>
        </div>

        <div className="space-y-2 text-[#F8F8F8]/60 text-[15px] font-light">
          <p className="text-white font-medium text-base mb-3">{t('contactAboutAccount')}</p>
          <p className="font-mono text-[14px] text-[#F8F8F8]/40">SK68 8330 0000 0022 0221 4313</p>
          <div className="pt-3 space-y-1">
            <p>{t('contactAboutReg1')}</p>
            <p>{t('contactAboutReg2')}</p>
            <p>{t('contactAboutReg3')}</p>
            <p>{t('contactAboutReg4')}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default About
