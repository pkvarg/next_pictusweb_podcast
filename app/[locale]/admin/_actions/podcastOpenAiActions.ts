'use server'
import { getTimeStamp } from '@/lib/timestamp'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

const openai = new OpenAI()

export async function createOpenAiSpeech(podcastTitle: string, voiceType: any, inputText: string) {
  try {
    const mp3Response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voiceType,
      input: inputText,
    })

    // Get the audio data as an ArrayBuffer
    const arrayBuffer = await mp3Response.arrayBuffer()

    const timestamp = getTimeStamp()
    const filename = `${podcastTitle}_${timestamp}.mp3`

    // const apiUrl =
    //   process.env.NODE_ENV === 'development'
    //     ? `http://localhost:3013/api/namedupload/pictusweb/${filename}`
    //     : `https://hono-api.pictusweb.com/api/namedupload/pictusweb/${filename}`
    const apiUrl = `https://hono-api.pictusweb.com/api/namedupload/pictusweb/${filename}`

    // Send the audio data
    const uploadResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/mpeg',
      },
      body: arrayBuffer,
    })

    if (!uploadResponse.ok) {
      console.error('Upload failed with status:', uploadResponse.status)
      const errorText = await uploadResponse.text().catch(() => 'Could not read error response')
      console.error('Error details:', errorText)
      throw new Error('Nepodarilo sa nahrať súbor')
    }

    const data = await uploadResponse.json()
    //console.log('Upload response data:', data)
    const frontendPath = data.imageUrl

    //console.log('front', frontendPath)

    return { frontendPath }
  } catch (error) {
    console.error('Error generating OpenAI speech:', error)
    throw error
  }
}
