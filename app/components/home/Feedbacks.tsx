'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { styles } from '@/lib/styles'
import { fadeIn, staggerContainer, textVariant } from '@/lib/motion'
import { useTranslations } from 'next-intl'
import { TypingText } from '../CustomTexts'

interface Testimonial {
  testimonial: string
  name: string
  designation: string
  company: string
  image: string
}

interface FeedbackCardProps extends Testimonial {
  index: number
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({
  index,
  testimonial,
  name,
  designation,
  company,
  image,
}) => (
  <motion.div
    initial={{ x: 250 }}
    animate={{ x: 0 }}
    transition={{ duration: 3 }}
    viewport={{ once: true, amount: 0.25 }}
    className='p-6 rounded-3xl xs:w-[320px] lg:mt-0 lg:mb-0 w-full bg-gray-800'
  >
    <div className='mt-1'>
      <p className='text-white tracking-wider text-[20px]'>"{testimonial}"</p>

      <div className='mt-7 flex flex-row justify-end mr-[5%] items-center gap-8 text-[#93A7B7]'>
        <p className='font-medium text-[18px]'>
          <span className='blue-text-gradient'>@</span> {name}
        </p>
        <p className='text-secondary text-[16px]'>
          {designation} - {company}
        </p>

        <img
          src={image}
          alt={`feedback_by-${name}`}
          className='w-10 h-10 rounded-full object-cover'
        />
      </div>
    </div>
  </motion.div>
)

const Feedbacks: React.FC = () => {
  const t = useTranslations('Home')
  const testimonials: Testimonial[] = [
    {
      testimonial: t('reviewsIoana'),
      name: 'Ioana Mindrila',
      designation: 'Designer',
      company: 'IoanaM',
      image: 'ionuca1.webp',
    },
    {
      testimonial: t('reviewsTom'),
      name: 'Tomas Dovala',
      designation: 'CEO',
      company: 'Dovala Construction',
      image: 'tomas1.webp',
    },
    {
      testimonial: t('reviewsLeo'),
      name: 'Leo Grman',
      designation: 'Manager',
      company: 'prud.sk',
      image: 'leo1.webp',
    },
    {
      testimonial: t('reviewsMich'),
      name: 'Michal Dovala',
      designation: t('reviewsDesignationMich'),
      company: 'michaldovala.sk',
      image: 'michal.webp',
    },
    {
      testimonial: t('reviewsSam'),
      name: 'Samuel Koriťák',
      designation: t('reviewsDesignationSam'),
      company: 'cestazivota.sk',
      image: 'sam1.webp',
    },
  ]
  return (
    <div className={`lg:mx-[15.5%] pt-[70px] lg:pt-[50px] rounded-[20px]`}>
      <div className={`rounded-2xl min-h-[200px]`}>
        <motion.div
          variants={staggerContainer(0.1, 0.3)}
          initial='hidden'
          whileInView='show'
          viewport={{ once: false, amount: 0.25 }}
        >
          <h1 className='text-[35px] text-center lg:mt-16 lg:mb-16'>
            <TypingText title={t('reviewsTitle')} />
          </h1>
        </motion.div>
      </div>
      <div className={`-mt-20 lg:-mt-20 lg:pb-14 mx-4  flex flex-col  gap-4`}>
        {testimonials.map((testimonial, index) => (
          <FeedbackCard key={testimonial.name} index={index} {...testimonial} />
        ))}
      </div>
    </div>
  )
}

export default Feedbacks

//export default SectionWrapper(Feedbacks, '')
