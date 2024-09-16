'use client'
import React from 'react'
import { Tilt } from 'react-tilt'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { TypingText } from '../CustomTexts'
import { staggerContainer } from '@/lib/motion'

interface Tag {
  name: string
  image: string
}

interface Project {
  name: string
  description: string
  tags: Tag[]
  image: string
  website: string
}

interface ProjectCardProps extends Project {
  index: number
  className?: string
}

const Projects: React.FC = () => {
  const t = useTranslations('Home')

  const react = '/tech/reactjs.webp'
  const vite = '/tech/vite.webp'
  const tailwind = '/tech/tailwind.webp'
  const redux = '/tech/redux.webp'
  const mongo = '/tech/mongodb.webp'
  const bootstrap = '/tech/bootstrap.webp'
  const next = '/tech/nextjs.webp'
  const prisma = '/tech/prisma.webp'
  const firebase = '/tech/firebase.webp'
  const typescript = '/tech/typescript.webp'
  const express = '/tech/express.webp'
  const postgres = '/tech/postgres.webp'
  const projects: Project[] = [
    {
      name: 'ioana-illustrations.eu',
      description: t('ourProjectsIoana'),
      tags: [
        {
          name: 'react',
          image: react,
        },
        {
          name: 'vite',
          image: vite,
        },
        {
          name: 'tailwind',
          image: tailwind,
        },
      ],
      image: 'ioana-page.webp',
      website: 'https://ioana-illustrations.eu/',
    },

    {
      name: 'prud.sk',
      description: t('ourProjectsPrud'),
      tags: [
        {
          name: 'mongodb',
          image: mongo,
        },

        {
          name: 'Express',
          image: express,
        },
        {
          name: 'react',
          image: react,
        },

        {
          name: 'redux',
          image: redux,
        },
      ],
      image: 'prud-page.webp',
      website: 'https://prud.sk/',
    },
    {
      name: 'kvalitnamontaz.sk',
      description: t('ourProjectsDvl'),
      tags: [
        {
          name: 'react',
          image: react,
        },
        {
          name: 'vite',
          image: vite,
        },
        {
          name: 'bootsrap 5',
          image: bootstrap,
        },
      ],
      image: 'dvl-page.webp',
      website: 'https://kvalitnamontaz.sk/',
    },
    {
      name: 'bible-blog.online',
      description: t('ourProjectsBlog'),
      tags: [
        {
          name: 'next.js 13',
          image: next,
        },
        {
          name: 'prisma',
          image: prisma,
        },
        {
          name: 'firebase',
          image: firebase,
        },
      ],
      image: 'bible_blog.webp',
      website: 'https://blog.pictusweb.site/',
    },
    {
      name: 'katolickaviera.sk',
      description: t('ourProjectsKatol'),
      tags: [
        {
          name: 'react',
          image: react,
        },
        {
          name: 'vite',
          image: vite,
        },
        {
          name: 'tailwind',
          image: tailwind,
        },
      ],
      image: 'katol.webp',
      website: 'https://katolickaviera.sk/',
    },
    {
      name: 'michaldovala.sk',
      description: t('ourProjectsEstate'),
      tags: [
        {
          name: 'next.js 14',
          image: next,
        },
        {
          name: 'Typescript',
          image: typescript,
        },
        {
          name: 'Express',
          image: express,
        },
      ],
      image: 'md.webp',
      website: 'https://michaldovala.sk/',
    },
    {
      name: 'librosophia.sk',
      description: t('ourProjectsLibro'),
      tags: [
        {
          name: 'next.js 13',
          image: next,
        },
        {
          name: 'Typescript',
          image: typescript,
        },
        {
          name: 'Prisma',
          image: prisma,
        },
      ],
      image: 'libro2.webp',
      website: 'https://librosophia.sk/',
    },
    {
      name: 'miestnacirkev.sk',
      description: t('ourProjectsChurch'),
      tags: [
        {
          name: 'next.js 14',
          image: next,
        },
        {
          name: 'Typescript',
          image: typescript,
        },
        {
          name: 'Postgres',
          image: postgres,
        },
      ],
      image: 'miestna_cirkev.webp',
      website: 'https://miestnacirkev.sk/',
    },
  ]

  const ProjectCard: React.FC<ProjectCardProps> = ({
    index,
    name,
    description,
    tags,
    image,
    website,
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.25 }}
        transition={{ duration: 5 }}
      >
        <Tilt
          options={{
            max: 45,
            scale: 1,
            speed: 450,
          }}
          className='bg-gray-900 p-5 rounded-2xl sm:w-[360px] w-full'
        >
          <div className='relative w-full h-[230px]'>
            <img
              src={image}
              alt='project_image'
              className='w-full h-full rounded-2xl'
            />
          </div>

          <div className='mt-5'>
            <div onClick={() => window.open(website, '_blank')}>
              <h3 className='text-white font-medium text-[30px] cursor-pointer'>
                {name}
              </h3>
            </div>
            <p className='mt-2 text-[#93A7B7] text-[20px]'>{description}</p>
          </div>

          <div className='mt-4 flex flex-wrap gap-2'>
            {tags.map((tag) => (
              <Image
                key={`${name}-${tag.name}`}
                className={`text-[22px]`}
                alt={`${name}-${tag.name}`}
                width={45}
                height={45}
                src={`${tag.image}`}
              />
            ))}
          </div>
        </Tilt>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        variants={staggerContainer(0.1, 0.3)}
        initial='hidden'
        whileInView='show'
        viewport={{ once: false, amount: 0.25 }}
      >
        <h1 id='projects' className='lg:scroll-mt-14 text-[35px] text-center'>
          <TypingText title={t('ourProjectsTitle')} />
        </h1>
      </motion.div>

      <div className='mt-4 lg:mt-20 flex justify-center flex-wrap gap-2 lg:gap-12 mx-4'>
        {projects.map((project, index) => (
          <ProjectCard
            key={`project-${index}`}
            index={index}
            {...project}
            className='opacity-1'
          />
        ))}
      </div>
    </>
  )
}

export default Projects
