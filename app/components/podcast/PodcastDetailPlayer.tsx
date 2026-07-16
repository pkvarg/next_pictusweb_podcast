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
import { Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAudio } from './AudioProvider'
import LoaderSpinner from '@/app/components/LoaderSpinner'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

const PodcastDetailPlayer = ({ id, title, audioPath, imagePath }: PodcastDetailPlayerProps) => {
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
    <div className="mt-6 flex w-full justify-between max-md:justify-center">
      <div className="flex flex-col gap-8 max-md:items-center md:flex-row">
        <Image
          src={imagePath}
          width={250}
          height={250}
          alt="Podcast image"
          className="aspect-square rounded-2xl"
        />
        <div className="flex w-full flex-col gap-5 max-md:items-center md:gap-9">
          <article className="flex flex-col gap-2 max-md:items-center">
            <h1 className="text-32 font-normal tracking-[-0.32px] text-white-1">{title}</h1>
          </article>

          <Button
            onClick={handlePlay}
            className="text-[25px] w-full max-w-[250px] bg-pictus-lime text-pictus-black hover:bg-pictus-lime600 rounded-full font-semibold gap-2"
          >
            <Play className="w-5 h-5 fill-current" /> Play podcast
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PodcastDetailPlayer
