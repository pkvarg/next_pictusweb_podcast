'use client'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getSinglePodcast } from '../../admin/_actions/podcastActions'
import PodcastDetailPlayer from '@/app/components/podcast/PodcastDetailPlayer'
import PagesHeader from '@/app/components/PagesHeader'
import NeedPodcast from '@/app/components/NeedPodcast'
import Footer from '@/app/components/Footer'
import { useTranslations } from 'next-intl'

interface Podcast {
  id: string
  title: string
  textPrompt: string
  imagePrompt: string
  description: string | null // Allow null
  audioPath: string
  imagePath: string
  category: string
  voiceType: string
  english: boolean
  published: boolean
}

const SinglePodcast = () => {
  const t = useTranslations('Home')
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
      <section className='flex flex-col mx-4 lg:mx-[10%] py-4 font-light'>
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

        <p className='text-[#a7a7a8] text-16 pt-[45px]'>
          {t('podcastDescription')} {podcast?.description}
        </p>
        <p className='text-[#a7a7a8] capitalize'>
          {t('podcastVoice')} {podcast?.voiceType}
        </p>

        <div className='flex flex-col gap-8 mt-4'>
          <div className='flex flex-col gap-4'>
            <h1 className='text-18 text-white-1'>Transcript:</h1>
            <p className='text-16 text-[#a7a7a8] text-justify'>
              {podcast?.textPrompt}
            </p>
          </div>
          <div className='flex flex-col gap-4'>
            {podcast?.imagePrompt && (
              <>
                <h1 className='text-18 text-white-1'>Image Prompt</h1>
                <p className='text-16 text-[#a7a7a8]'>{podcast?.imagePrompt}</p>
              </>
            )}
          </div>
        </div>
      </section>
      <NeedPodcast />
      <Footer />
    </>
  )
}

export default SinglePodcast
