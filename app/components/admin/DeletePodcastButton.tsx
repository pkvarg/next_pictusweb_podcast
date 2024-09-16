'use client'
import React, { useState } from 'react'
import { deleteSinglePodcast } from '@/app/[locale]/admin/_actions/podcastActions'

interface Podcast {
  podcastId: string
}

const DeletePodcastButton: React.FC<Podcast> = (podcastId) => {
  const [message, setMessage] = useState('')
  const deletePodcast = async (e: any, podcastId: string) => {
    e.preventDefault()
    const userConfirmed = confirm('Are you sure you want to delete this item?')
    if (userConfirmed) {
      // Perform the delete operation
      const response = await deleteSinglePodcast(podcastId)

      if (response.message) setMessage(response.message)
    } else {
      // Cancel the delete operation
      console.log('Delete operation cancelled')
    }
  }

  return (
    <>
      <button
        className='text-red-500 text-[18px] '
        onClick={(e) => deletePodcast(e, podcastId.podcastId)}
      >
        Delete Podcast
      </button>
      {message && (
        <p className='text-green-600 text-[15px] bg-white'>{message}</p>
      )}
    </>
  )
}

export default DeletePodcastButton
