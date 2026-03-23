import PodcastPage from './../../components/podcast/PodcastPage'
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

  if (podcasts.length === 0) {
    return (
      <div className="min-h-screen bg-[#161616] text-white flex items-center justify-center relative">
        <div className="fixed inset-0 z-0 pointer-events-none stars-small" />
        <div className="fixed inset-0 z-0 pointer-events-none stars-medium" />
        <div className="text-center relative z-10">
          <h1 className="font-brutal-milk text-4xl mb-4">No Podcasts Found</h1>
          <p className="text-[#F8F8F8]/50 font-light">Check back soon for new AI-generated podcasts!</p>
        </div>
      </div>
    )
  }

  // Transform the data to handle null values
  const transformedPodcasts = podcasts.map((podcast) => ({
    ...podcast,
    category: podcast.category || 'Uncategorized', // Provide default value for null
    english: podcast.english ?? false, // Provide default value for null
  }))

  return <PodcastPage podcasts={transformedPodcasts} />
}

export default Podcast
