'use client'
import AdminBack from '@/app/components/admin/AdminBack'
import React from 'react'
import { createAzureSpeech } from '../_actions/podcastAzureActions'
import { createElevenlabsSpeech } from '../_actions/podcastElevenlabsActions'
import { voices } from '../_actions/podcastElevenlabsActions'

const AI = () => {
  const start = async () => {
    const voiceType = 'Lukas'
    const text = `Dobrý deň ja som ${voiceType}, hovorím po slovensky.`
    const podcastTitle = 'azureTitul'

    await createAzureSpeech(podcastTitle, voiceType, text)
  }
  const startEleven = async () => {
    //const voiceType = 'Karol'
    const voiceType = 'Jessica'
    const text = `Dobrý deň ja som ${voiceType}, hovorím po slovensky.`
    const podcastTitle = '11labs'

    await createElevenlabsSpeech(podcastTitle, voiceType, text)
  }
  const getVoices = async () => {
    await voices()
  }
  return (
    <div>
      <AdminBack />
      <h1 className='text-center'>AI</h1>
      <button onClick={() => start()}>Start Azure TTS</button>
      <br />
      <button onClick={() => startEleven()}>Start Elevenlabs</button>
      <br />
      <button onClick={() => getVoices()}>Get Elevenlabs voices</button>
    </div>
  )
}

export default AI
