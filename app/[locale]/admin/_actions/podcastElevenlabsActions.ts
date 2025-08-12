'use server'
import { ElevenLabsClient, ElevenLabs } from '@elevenlabs/elevenlabs-js'
import axios from 'axios'
import { getTimeStamp } from '@/lib/timestamp'
import fs from 'fs'
import path from 'path'
//import { uploadFirebase } from './uploadToFirebase'

const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_KEY })

//console.log('client', client)
const Andrej = 'bYqmvVkXUBwLwYpGHGz3'
const Karol = 'IKne3meq5aSn9XLyUdCD'
const Sara = 'EXAVITQu4vr4xnSDxMaL'
const Leo = 'FGY2WhTYpPnrIDTdsKH5'
const Juraj = 'JBFqnCBsd6RMkjVDRZzb'
const Peter = 'N2lVS1w4EtoT3dr4eOWO'
const Liam = 'TX3LPaxmHKxFdv7VOQHJ'
const Karolina = 'XB0fDUnXU5powFXDhCwa'
const Alica = 'Xb7hH8MSUJpSbSDYk0k2'
const Matilda = 'XrExE9yKIg1WjnnlVkGX'
const Lily = 'pFZP5JQG7iQjIQuC4Bku'

//const Wiliam = 'bIHbv24MWmeRgasZH58o'

const Jessica = 'cgSgspJ2msm6clMCkdW9'

const Erik = 'cjVigY5qzO86Huf0OWal'
//const Christofer = 'iP95p4xoKVk53GoZ742B'
//const Brian = 'nPczCjzI2devNBz1zQrb'
//const Daniel = 'onwK4e9ZLuTAKqWW03F9'

//const Billy = 'pqHfZKP75CvOlQylNhV4'

// this was ok before adding firebase
export async function createElevenlabsSpeech(
  podcastTitle: string,
  voiceType: any,
  inputText: string,
) {
  function getVoiceId(voiceType: string): string {
    // Create a mapping between the voiceType and voiceId
    const voiceMap: { [key: string]: string } = {
      andrej: Andrej,
      karol: Karol,
      sara: Sara,
      leo: Leo,
      juraj: Juraj,
      peter: Peter,
      liam: Liam,
      erik: Erik,
      jessica: Jessica,
      karolina: Karolina,
      alica: Alica,
      matilda: Matilda,
      lily: Lily,
    }

    // Return the corresponding voiceId or handle undefined voiceTypes
    return voiceMap[voiceType.toLowerCase()] || ''
  }

  const voiceId = getVoiceId(voiceType)

  const model = 'eleven_multilingual_v2'
  //const model = 'eleven_turbo_v2_5'

  try {
    // Convert text to speech
    const mp3Stream = await client.textToSpeech.convert(voiceId, {
      optimize_streaming_latency: ElevenLabs.OptimizeStreamingLatency.Zero,
      output_format: ElevenLabs.OutputFormat.Mp32205032,
      text: inputText,
      //model_id: 'eleven_turbo_v2_5',
      model_id: model,

      voice_settings: {
        stability: 0.1,
        similarity_boost: 0.3,
        style: 0.2,
      },
    })

    //console.log('mp3 stream', mp3Stream)

    // Convert the stream to a buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of mp3Stream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    const timestamp = getTimeStamp()
    const filename = `${podcastTitle}_${timestamp}.mp3`

    // const apiUrl =
    //   process.env.NODE_ENV === 'development'
    //     ? `http://localhost:3013/api/namedupload/pictusweb/${filename}`
    //     : `https://hono-api.pictusweb.com/api/namedupload/pictusweb/${filename}`
    const apiUrl = `https://hono-api.pictusweb.com/api/namedupload/pictusweb/${filename}`

    // Send the buffer data
    const uploadResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/mpeg', // Correct content type for MP3
      },
      //body: new Uint8Array(buffer),
      body: buffer,
    })

    if (!uploadResponse.ok) {
      console.error('Upload failed with status:', uploadResponse.status)
      const errorText = await uploadResponse.text().catch(() => 'Could not read error response')
      console.error('Error details:', errorText)
      throw new Error('Nepodarilo sa nahrať súbor')
    }

    const data = await uploadResponse.json()

    const frontendPath = data.imageUrl

    return { frontendPath }
  } catch (error) {
    console.error('Error generating speech:', error)
  }
}

// get voices Names  2
export async function voices() {
  const apiKey = process.env.ELEVEN_KEY!
  const url = 'https://api.elevenlabs.io/v1/voices'

  try {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        'xi-api-key': apiKey,
      },
    })

    const voices = response.data.voices

    // Filter for Slovak female voices
    const slovakFemaleVoices = voices.filter(
      (voice: any) => voice.language === 'sk-SK' && voice.gender === 'female',
    )

    // Extract and return voice IDs
    const voiceIds = slovakFemaleVoices.map((voice: any) => ({
      name: voice.name,
      id: voice.voice_id,
    }))

    return voiceIds
  } catch (error) {
    console.error('Error fetching voices:', error)
    throw error
  }
}
