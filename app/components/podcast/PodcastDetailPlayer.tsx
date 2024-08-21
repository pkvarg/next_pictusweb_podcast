'use client'

interface PodcastDetailPlayerProps {
  id: string
  title: string
  textPrompt: string
  imagePrompt: string
  description: string | null // Allow null
  audioPath: string
  imagePath: string
  category: string
  english: boolean
  published: boolean
}

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAudio } from './AudioProvider'

import LoaderSpinner from '@/app/components/LoaderSpinner'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

const PodcastDetailPlayer = ({
  id,
  title,
  audioPath,
  imagePath,
}: PodcastDetailPlayerProps) => {
  const router = useRouter()
  const { setAudio } = useAudio()
  const { toast } = useToast()

  const handlePlay = () => {
    setAudio({
      title,
      audioPath,
      imagePath,
      id,
    })
  }

  if (!imagePath) return <LoaderSpinner />

  return (
    <div className='mt-6 flex w-full justify-between max-md:justify-center'>
      <div className='flex flex-col gap-8 max-md:items-center md:flex-row'>
        <Image
          src={imagePath}
          width={250}
          height={250}
          alt='Podcast image'
          className='aspect-square rounded-xl'
        />
        <div className='flex w-full flex-col gap-5 max-md:items-center md:gap-9'>
          <article className='flex flex-col gap-2 max-md:items-center'>
            <h1 className='text-32 font-extrabold tracking-[-0.32px] text-white-1'>
              {title}
            </h1>
          </article>

          <Button
            onClick={handlePlay}
            className='text-[25px] w-full max-w-[250px] bg-orange-500 text-white rounded-xl'
          >
            <Image
              src='/icons/Play.svg'
              width={20}
              height={20}
              alt='random play'
            />{' '}
            &nbsp; Play podcast
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PodcastDetailPlayer
