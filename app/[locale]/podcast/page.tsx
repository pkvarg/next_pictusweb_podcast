import Footer from '@/app/components/Footer'
import PagesHeader from '@/app/components/PagesHeader'
import PodcastImage from '@/app/components/podcast/GoToSinglePodcast'
import db from '@/db/db'
import React from 'react'

const Podcast = async () => {
  const podcasts = await db.podcast.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      textPrompt: true,
      imagePrompt: true,
      audioPath: true,
      imagePath: true,
      category: true,
      english: true,
      published: true,
    },
    where: {
      deleted: false,
      published: true,
    },
    orderBy: { updatedAt: 'desc' },
  })
  if (podcasts.length === 0) return <p>No podcasts found</p>
  return (
    <>
      <div className='hero-gradient flex flex-col justify-center items-center min-h-screen'>
        <PagesHeader />
        <h1 className='text-[30px] text-center py-8'>Podcasts</h1>
        <div className='grid grid-cols-3 gap-8 justify-center my-8'>
          {podcasts.map((podcast) => (
            <div key={podcast.id}>
              <PodcastImage
                imagePath={podcast.imagePath || '/icons/headphones.svg'}
                title={podcast.title}
                id={podcast.id}
              />

              <div className='ml-4 mt-2'>
                <p className='text-[18px]'>{podcast.title}</p>
                <p className='text-[16px] text-gray-300'>
                  {podcast.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className='w-full'>
          <Footer />
        </div>
      </div>
    </>
  )
}

export default Podcast
