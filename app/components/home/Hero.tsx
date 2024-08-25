'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { staggerContainer } from '@/lib/motion'
import { TitleText, TypingText } from '../CustomTexts'
import { useTranslations } from 'next-intl'
import { styles } from '@/lib/styles'

const Hero = () => {
  const t = useTranslations('Home')
  const title1 = t('heroTitle1')
  const title2 = t('heroTitle2')
  const title3 = t('heroTitle3')

  return (
    <main className='flex lg:flex-row flex-col justify-center items-center mx-[10%] py-[100px]'>
      <motion.div
        variants={staggerContainer(0.1, 0.3)}
        initial='hidden'
        whileInView='show'
        viewport={{ once: false, amount: 0.25 }}
        className={`${styles.innerWidth} mx-auto flex lg:flex-row flex-col gap-8 lg:py-[100px] py-[50px]`}
      >
        <div className='flex flex-col justify-left'>
          <h1 className='text-white text-[45px] lg:text-[75px]'>
            <TypingText title={title1} />
          </h1>
          <h1 className='text-white text-[45px] lg:text-[50px] mb-[2rem]'>
            <TypingText title={title2} />
          </h1>

          <div className='text-white text-[30px] lg:text-[40px]'>
            <TitleText title={title3} />
          </div>
        </div>
      </motion.div>
      <div className='lg:w-[100%]'>
        <img
          className='w-[100%] ml-auto lg:mt-0 mt-[6rem]'
          src='/hero-builders.webp'
          alt='hero'
        />
      </div>
    </main>
  )
}

export default Hero
