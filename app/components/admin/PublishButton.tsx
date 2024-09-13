'use client'
import { changePodcastPublishStatus } from '@/app/[locale]/admin/_actions/podcastActions'
import React, { startTransition, useState } from 'react'

interface Publish {
  published: boolean
  podcastId: string
}

const PublishButton: React.FC<Publish> = ({ published, podcastId }) => {
  const [message, setMessage] = useState('')
  const [newPublishStatus, setNewPublishStatus] = useState<boolean>(false)

  const changePublishStatus = async (e: any) => {
    e.preventDefault()
    setNewPublishStatus(!published)

    try {
      const formData = new FormData()
      formData.append('id', podcastId)
      formData.append('publish', newPublishStatus.toString())

      startTransition(async () => {
        const result = await changePodcastPublishStatus(formData)
        setMessage(result.message)
      })
    } catch (error) {
      console.error('Error in form submission:', error)
    }
  }

  return (
    <>
      {message ? (
        <p className='text-green-600 text-[15px] my-2 px-4 bg-white'>
          {message}
        </p>
      ) : (
        <button
          onClick={changePublishStatus}
          className={
            published
              ? 'my-8 py-1 px-8 bg-orange-900 text-white rounded-xl'
              : 'my-8 py-1 px-8  bg-green-500 text-white rounded-xl'
          }
        >
          {published ? 'Unpublish' : 'Publish'}
        </button>
      )}
    </>
  )
}

export default PublishButton
