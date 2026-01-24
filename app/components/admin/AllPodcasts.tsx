import React from 'react'
import db from '@/db/db'
import EditPodcastButton from './EditPodcastButton'
import DeletePodcastButton from './DeletePodcastButton'
import Image from 'next/image'
import PreviewAudio from '@/lib/PreviewAudio'
import PublishButton from './PublishButton'
import { 
  Mic, 
  Globe, 
  Volume2, 
  Calendar,
  Eye,
  EyeOff,
  Headphones
} from 'lucide-react'

export default async function AllPodcasts() {
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
      voiceType: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      deleted: false,
    },
    orderBy: { updatedAt: 'desc' },
  })

  if (podcasts.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Headphones className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Podcasts Found</h3>
          <p className="text-gray-400 mb-6">Start creating your first AI-generated podcast</p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Mic className="h-4 w-4 mr-2" />
            Create Your First Podcast
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">All Podcasts</h2>
          <p className="text-gray-400 mt-1">{podcasts.length} podcast{podcasts.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>Sorted by recent</span>
        </div>
      </div>

      {/* Podcasts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {podcasts.map((podcast) => (
          <div
            key={podcast.id}
            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-200 hover:scale-[1.02]"
          >
            {/* Image Header */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-600/20">
              {podcast.imagePath ? (
                <Image
                  src={podcast.imagePath}
                  alt={podcast.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Headphones className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  podcast.published 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {podcast.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  <span>{podcast.published ? 'Published' : 'Draft'}</span>
                </div>
              </div>

              {/* Language Badge */}
              <div className="absolute top-3 left-3">
                <div className="flex items-center space-x-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                  <Globe className="h-3 w-3" />
                  <span>{podcast.english ? 'EN' : 'SK'}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Title & Category */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                  {podcast.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Mic className="h-4 w-4" />
                  <span>{podcast.category || 'Uncategorized'}</span>
                </div>
              </div>

              {/* Description */}
              {podcast.description && (
                <p className="text-gray-300 text-sm line-clamp-3">
                  {podcast.description}
                </p>
              )}

              {/* Voice Type */}
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Volume2 className="h-4 w-4" />
                <span>Voice: {podcast.voiceType}</span>
              </div>

              {/* Audio Preview */}
              {podcast.audioPath && (
                <div className="pt-2">
                  <PreviewAudio audioPath={podcast.audioPath} />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <PublishButton
                    key={podcast.published.toString()}
                    published={podcast.published}
                    podcastId={podcast.id}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <EditPodcastButton
                    link={`/admin/audio/edit/${podcast.id}`}
                  />
                  <DeletePodcastButton podcastId={podcast.id} />
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-gray-500 pt-2">
                Created: {new Date(podcast.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
