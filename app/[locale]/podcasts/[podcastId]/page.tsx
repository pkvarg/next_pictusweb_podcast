import React from 'react'
import db from '@/db/db'
import PodcastDetailPlayer from '@/app/components/podcast/PodcastDetailPlayer'
import PagesHeader from '@/app/components/PagesHeader'
import NeedPodcast from '@/app/components/NeedPodcast'
import Footer from '@/app/components/Footer'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import StructuredData from '@/app/components/StructuredData'

interface Podcast {
  id: string
  title: string
  textPrompt: string
  imagePrompt: string
  description: string | null
  audioPath: string
  imagePath: string
  category: string
  voiceType: string
  english: boolean
  published: boolean
  createdAt: Date
  updatedAt: Date
}

interface PageProps {
  params: Promise<{ podcastId: string; locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { podcastId, locale } = await params
  
  // Enable static rendering for next-intl
  setRequestLocale(locale)

  const podcast = await db.podcast.findUnique({
    where: { id: podcastId, deleted: false, published: true },
    select: {
      id: true,
      title: true,
      description: true,
      imagePath: true,
      english: true,
      category: true,
      updatedAt: true,
    },
  })

  if (!podcast) {
    return {
      title: 'Podcast Not Found',
      description: 'The requested podcast could not be found.',
    }
  }

  const t = await getTranslations({ locale, namespace: 'Home' })

  return {
    title: `${podcast.title} - ${t('podcastsTitle')} | Pictusweb`,
    description: podcast.description || `AI-generated podcast: ${podcast.title}`,
    openGraph: {
      title: podcast.title,
      description: podcast.description || `AI-generated podcast: ${podcast.title}`,
      type: 'article',
      url: `https://www.pictusweb.sk/${locale}/podcast/${podcast.id}`,
      images: [
        {
          url: podcast.imagePath || '',
          width: 400,
          height: 400,
          alt: podcast.title,
        },
      ],
      publishedTime: podcast.updatedAt.toISOString(),
    },
    alternates: {
      canonical: `https://www.pictusweb.sk/${locale}/podcast/${podcast.id}`,
      languages: {
        en: `https://www.pictusweb.sk/en/podcast/${podcast.id}`,
        sk: `https://www.pictusweb.sk/sk/podcast/${podcast.id}`,
        hu: `https://www.pictusweb.sk/hu/podcast/${podcast.id}`,
      },
    },
  }
}

const SinglePodcast = async ({ params }: PageProps) => {
  const { podcastId, locale } = await params
  
  // Enable static rendering for next-intl
  setRequestLocale(locale)
  
  const t = await getTranslations('Home')

  const podcast = await db.podcast.findUnique({
    where: { id: podcastId, deleted: false, published: true },
    select: {
      id: true,
      title: true,
      textPrompt: true,
      imagePrompt: true,
      description: true,
      audioPath: true,
      imagePath: true,
      category: true,
      voiceType: true,
      english: true,
      published: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!podcast) {
    notFound()
  }

  return (
    <>
      <StructuredData
        type="podcast"
        data={{
          ...podcast,
          locale,
          publishedAt: podcast.createdAt.toISOString(),
          updatedAt: podcast.updatedAt.toISOString(),
        }}
      />

      <PagesHeader />

      <section className="flex flex-col mx-4 lg:mx-[10%] py-4 font-light">
        <Link href={`/podcasts`} className="hover:text-[#0388f4] py-2 w-auto">
          {t('podcastsBack')}
        </Link>

        <PodcastDetailPlayer
          id={podcast.id}
          title={podcast.title}
          textPrompt={podcast.textPrompt}
          imagePrompt={podcast.imagePrompt || ''}
          description={podcast.description || ''}
          audioPath={podcast.audioPath}
          imagePath={podcast.imagePath || ''}
          category={podcast.category || 'Uncategorized'}
          english={podcast.english ?? false}
          published={podcast.published}
        />

        <p className="text-[#a7a7a8] text-16 pt-[45px]">
          {t('podcastDescription')} {podcast.description}
        </p>
        <p className="text-[#a7a7a8] capitalize">
          {t('podcastVoice')} {podcast.voiceType}
        </p>

        <div className="flex flex-col gap-8 mt-4">
          <div className="flex flex-col gap-4">
            <h1 className="text-18 text-white-1">Transcript:</h1>
            <p className="text-16 text-[#a7a7a8] text-justify">{podcast.textPrompt}</p>
          </div>
          <div className="flex flex-col gap-4">
            {podcast.imagePrompt && (
              <>
                <h1 className="text-18 text-white-1">Image Prompt</h1>
                <p className="text-16 text-[#a7a7a8]">{podcast.imagePrompt}</p>
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
