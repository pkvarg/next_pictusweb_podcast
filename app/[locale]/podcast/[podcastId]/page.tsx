'use client'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getSinglePodcast } from '../../admin/_actions/podcastActions'
import Image from 'next/image'
import PodcastDetailPlayer from '@/app/components/podcast/PodcastDetailPlayer'
import PagesHeader from '@/app/components/PagesHeader'
import Footer from '@/app/components/Footer'

interface Podcast {
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

const SinglePodcast = () => {
  const { podcastId } = useParams()
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const getPodcast = async () => {
    if (podcastId) {
      const singlePodcast = await getSinglePodcast(podcastId.toString())

      if (singlePodcast.success && singlePodcast.podcast) {
        setPodcast({
          ...singlePodcast.podcast,
          description: singlePodcast.podcast.description || '',
        } as Podcast)
      }
    }
  }

  useEffect(() => {
    getPodcast()
  }, [])

  return (
    <>
      <PagesHeader />
      <section className='flex flex-col mx-4 lg:mx-[10%] py-4'>
        <header className='mt-9 flex items-center justify-between'>
          <h1 className='text-20 font-bold text-white-1'>Currenty Playing</h1>
          {/* <figure className='flex gap-3'>
        <Image
          src='/icons/headphone.svg'
          width={24}
          height={24}
          alt='headphone'
        />
        
      </figure> */}
        </header>

        {podcast && (
          <PodcastDetailPlayer
            id={podcast.id}
            title={podcast.title}
            textPrompt={podcast.textPrompt}
            imagePrompt={podcast.imagePrompt}
            description={podcast.description}
            audioPath={podcast.audioPath}
            imagePath={podcast.imagePath}
            category={podcast.category}
            english={podcast.english}
            published={podcast.published}
          />
        )}

        <p className='text-[#a7a7a8] text-16 pb-8 pt-[45px] font-medium max-md:text-center'>
          {podcast?.description}
        </p>

        <div className='flex flex-col gap-8'>
          <div className='flex flex-col gap-4'>
            <h1 className='text-18 font-bold text-white-1'>Transcript</h1>
            <p className='text-16 font-light text-[#a7a7a8] text-justify'>
              {podcast?.textPrompt}
            </p>
          </div>
          <div className='flex flex-col gap-4'>
            {podcast?.imagePrompt && (
              <>
                <h1 className='text-18 font-bold text-white-1'>Image Prompt</h1>
                <p className='text-16 font-light text-[#a7a7a8]'>
                  {podcast?.imagePrompt}
                </p>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default SinglePodcast
