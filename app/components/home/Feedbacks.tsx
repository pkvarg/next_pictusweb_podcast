'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { styles } from '@/lib/styles'
import { fadeIn, staggerContainer, textVariant } from '@/lib/motion'
import { useTranslations } from 'next-intl'
import { TypingText } from '../CustomTexts'
import Image from 'next/image'

interface Testimonial {
  testimonial: string
  name: string
  designation: string
  company: string
  image: string
  companyUrl?: string
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
  companyUrl,
}) => (
  <motion.div
    initial={{ x: 250 }}
    animate={{ x: 0 }}
    transition={{ duration: 3 }}
    viewport={{ once: true, amount: 0.25 }}
    className="p-6 rounded-3xl xs:w-[320px] lg:mt-0 lg:mb-0 w-full bg-gray-800"
  >
    <div className="mt-1">
      <p className="text-white tracking-wider text-[20px]">&quot;{testimonial}&quot;</p>

      <div className="mt-7 flex flex-row justify-end mr-[5%] items-center gap-8 text-[#93A7B7]">
        <p className="font-medium text-[18px]">
          <span className="blue-text-gradient">@</span> {name}
        </p>
        <p className="text-secondary text-[16px]">
          {designation} -{' '}
          {companyUrl ? (
            <a
              href={companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors cursor-pointer underline"
            >
              {company}
            </a>
          ) : (
            company
          )}
        </p>

        <Image
          src={`/${image}`}
          alt={`feedback_by-${name}`}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
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
      companyUrl: 'https://ioana-illustrations.eu/',
    },
    {
      testimonial: t('reviewsTom'),
      name: 'Tomas Dovala',
      designation: 'CEO',
      company: 'Dovala Construction',
      image: 'tomas1.webp',
      companyUrl: 'https://www.kvalitnamontaz.sk/',
    },
    {
      testimonial: t('reviewsLeo'),
      name: 'Leo Grman',
      designation: 'Manager',
      company: 'prud.sk',
      image: 'leo1.webp',
      companyUrl: 'https://prud.sk/',
    },
    {
      testimonial: t('reviewsMich'),
      name: 'Michal Dovala',
      designation: t('reviewsDesignationMich'),
      company: 'michaldovala.sk',
      image: 'michal.webp',
      companyUrl: 'https://michaldovala.vercel.app/',
    },
    {
      testimonial: t('reviewsSam'),
      name: 'Samuel Koriťák',
      designation: t('reviewsDesignationSam'),
      company: 'cestazivota.sk',
      image: 'sam1.webp',
      companyUrl: 'https://cestazivota.sk',
    },
    {
      testimonial: t('reviewsVlado'),
      name: 'Vladimír Chovanec',
      designation: t('reviewsDesignationVlado'),
      company: 'fyziology.sk',
      image: 'vlado.webp',
      companyUrl: 'https://fyziology.sk',
    },
    {
      testimonial: t('reviewsJan'),
      name: 'Ján Prievozník',
      designation: t('reviewsDesignationJan'),
      company: 'bow4bass.com',
      image: 'jp-review.webp',
      companyUrl: 'https://bow4bass.com/',
    },
  ]
  return (
    <div className={`lg:mx-[15.5%] pt-[70px] lg:pt-[50px] rounded-[20px]`}>
      <div className={`rounded-2xl min-h-[200px]`}>
        <motion.div
          variants={staggerContainer(0.1, 0.3)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.25 }}
        >
          <h1 className="text-[35px] text-center lg:mt-16 lg:mb-16">
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
