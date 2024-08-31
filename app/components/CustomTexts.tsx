import { motion } from 'framer-motion'
import { textContainer, textVariant2 } from '@/lib/motion'

interface TypingTextProps {
  title: string
}

interface TitleTextProps {
  title: string
}

export const TypingText: React.FC<TypingTextProps> = ({ title }) => (
  <motion.p
    variants={textContainer}
    className={`font-light text-secondary-white`}
  >
    {Array.from(title).map((letter, index) => (
      <motion.span variants={textVariant2} key={index}>
        {letter === ' ' ? '\u00A0' : letter}
      </motion.span>
    ))}
  </motion.p>
)

export const TitleText: React.FC<TitleTextProps> = ({ title }) => (
  <motion.p
    variants={textVariant2}
    initial='hidden'
    whileInView='show'
    className='font-light'
  >
    {title}
  </motion.p>
)
