'use client'
import React, { useRef, useState } from 'react'

type PreviewAudioProps = {
  audioPath: string
}

const PreviewAudio: React.FC<PreviewAudioProps> = ({ audioPath }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying) // Toggle play/pause state
    }
  }

  return (
    <div>
      <audio ref={audioRef} src={audioPath} />
      {/* <p className='text-white'>{audioPath}</p> */}
      <button
        className='cursor-pointer hover:text-green-500 bg-orange-500 px-4 py-2 rounded-xl'
        onClick={handlePlay}
      >
        {isPlaying ? 'Pause' : 'Play Audio'}
      </button>
    </div>
  )
}

export default PreviewAudio
