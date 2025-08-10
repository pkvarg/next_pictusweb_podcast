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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-4">No Podcasts Found</h1>
          <p className="text-gray-400">Check back soon for new AI-generated podcasts!</p>
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
