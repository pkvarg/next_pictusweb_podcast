'use server'
import { getTimeStamp } from '@/lib/timestamp'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
//import path from 'path'
//import fs from 'fs'

const subscriptionKey = process.env.AZURE_TTS_1!
const serviceRegion = process.env.AZURE_TTS_REGION!

if (!subscriptionKey || !serviceRegion) {
  throw new Error('Azure TTS subscription key or region is not defined.')
}

// import fs from 'fs';
// import path from 'path';
// import sdk from 'microsoft-cognitiveservices-speech-sdk'; // Adjust the import as necessary

export async function createAzureSpeech(
  podcastTitle: string,
  voiceType: any,
  inputText: string,
): Promise<any> {
  const rate = '-20%'
  const timestamp = getTimeStamp()

  const voice = voiceType === 'Lukas' ? 'sk-SK-LukasNeural' : 'sk-SK-ViktoriaNeural'

  const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion)

  const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput() // We'll output it to a stream instead of a file.

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="sk-SK">
      <voice name="${voice}">
        <prosody rate="${rate}">
          ${inputText}
        </prosody>
      </voice>
    </speak>
  `

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)

  try {
    const result = await new Promise<sdk.SpeechSynthesisResult>(
      (resolve, reject) => {
        synthesizer.speakSsmlAsync(ssml, resolve, reject)
      }
    )

    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
      console.log('Synthesis finished.')

      // Convert the result.audioData (Uint8Array) to Buffer
      const buffer = Buffer.from(result.audioData)

      const filename = `${podcastTitle}_${timestamp}.mp3`
      const apiUrl = `https://hono-api.pictusweb.com/api/namedupload/pictusweb/${filename}`

      // Upload the buffer to the API
      const uploadResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/mpeg',
        },
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
    } else {
      console.error('Speech synthesis canceled:', result.errorDetails)
      throw new Error(result.errorDetails)
    }
  } catch (err) {
    console.error('Error during synthesis:', err)
    throw err
  } finally {
    synthesizer.close()
  }
}
