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
        className='cursor-pointer bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black text-[14px] px-4 py-2 rounded-xl font-normal hover:from-pictus-lime400 hover:to-pictus-lime700 transition-all shadow-lg hover:shadow-pictus-lime/50'
        onClick={handlePlay}
      >
        {isPlaying ? 'Pause' : 'Play Audio'}
      </button>
    </div>
  )
}

export default PreviewAudio
