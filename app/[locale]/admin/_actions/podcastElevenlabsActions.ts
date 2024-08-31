'use server'
import { ElevenLabsClient, ElevenLabs } from 'elevenlabs'
import axios from 'axios'

import fs from 'fs'
import path from 'path'

const client = new ElevenLabsClient({ apiKey: process.env.ELEVEN_KEY })
const Andrej = 'bYqmvVkXUBwLwYpGHGz3'
const Karol = 'IKne3meq5aSn9XLyUdCD'
const Sara = 'EXAVITQu4vr4xnSDxMaL'
const Leo = 'FGY2WhTYpPnrIDTdsKH5'
const Juraj = 'JBFqnCBsd6RMkjVDRZzb'
const Peter = 'N2lVS1w4EtoT3dr4eOWO'
const Liam = 'TX3LPaxmHKxFdv7VOQHJ'
//const Karolina = 'XB0fDUnXU5powFXDhCwa'
//const Alica = 'Xb7hH8MSUJpSbSDYk0k2'
//const Matilda = 'XrExE9yKIg1WjnnlVkGX'

//const Wiliam = 'bIHbv24MWmeRgasZH58o'
//const Jessica = 'cgSgspJ2msm6clMCkdW9'
const Jessica = 'cgSgspJ2msm6clMCkdW9'

const Erik = 'cjVigY5qzO86Huf0OWal'
//const Christofer = 'iP95p4xoKVk53GoZ742B'
//const Brian = 'nPczCjzI2devNBz1zQrb'
//const Daniel = 'onwK4e9ZLuTAKqWW03F9'
//const Lily = 'pFZP5JQG7iQjIQuC4Bku'
//const Billy = 'pqHfZKP75CvOlQylNhV4'

export async function createElevenlabsSpeech(
  podcastTitle: string,
  voiceType: any,
  inputText: string
) {
  const voiceId = voiceType === 'andrej' ? Andrej : 'karol' ? Karol : Jessica

  //const model = 'eleven_multilingual_v2'
  const model = 'eleven_turbo_v2_5'

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

    const timestamp = new Date().toISOString().replace(/[-:.]/g, '')
    const filename = `${podcastTitle}_${timestamp}.mp3`
    const frontendPath = `/podcast/mp3s/${podcastTitle}_${timestamp}.mp3`
    const speechFilePath = path.resolve(`./public/podcast/mp3s/${filename}`)

    // Write the stream data to a file
    const writeStream = fs.createWriteStream(speechFilePath)
    mp3Stream.pipe(writeStream)

    // Wait for the file to be fully written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })

    // Return the path to the frontend
    return { frontendPath }
  } catch (error) {
    console.error('Error generating speech:', error)
  }
}

// get voices Names 1
// export async function voices() {
//   const keys = process.env.ELEVEN_KEY
//   const url = 'https://api.elevenlabs.io/v1/voices'
//   const headers = {
//     Accept: 'application/json',
//     'xi-api-key': keys,
//   }

//   try {
//     const response = await axios.get(url, { headers })

//     // Ensure data is accessed correctly
//     const data = response.data

//     // Loop through the voices and print their details
//     for (const voice of data['voices']) {
//       console.log(`${voice['name']}; ${voice['voice_id']}`)
//     }
//     return null
//   } catch (error) {
//     console.error('Error fetching voices:', error)
//   }
// }

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
      (voice: any) => voice.language === 'sk-SK' && voice.gender === 'female'
    )

    // Extract and return voice IDs
    const voiceIds = slovakFemaleVoices.map((voice: any) => ({
      name: voice.name,
      id: voice.voice_id,
    }))

    console.log('voiceIds', voiceIds)

    return voiceIds
  } catch (error) {
    console.error('Error fetching voices:', error)
    throw error
  }
}
