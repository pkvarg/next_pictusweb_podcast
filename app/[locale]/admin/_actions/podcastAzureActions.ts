'use server'
import { getTimeStamp } from '@/lib/timestamp'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import path from 'path'

const subscriptionKey = process.env.AZURE_TTS_1!
const serviceRegion = process.env.AZURE_TTS_REGION!

if (!subscriptionKey || !serviceRegion) {
  throw new Error('Azure TTS subscription key or region is not defined.')
}

export async function createAzureSpeech(
  podcastTitle: string,
  voiceType: any,
  inputText: string
): Promise<any> {
  const rate = '-20%'
  const timestamp = getTimeStamp()

  const frontendPath = `/podcast/mp3s/${podcastTitle}_${timestamp}.mp3`

  const speechFile = path.resolve(
    `./public/podcast/mp3s/${podcastTitle}_${timestamp}.mp3`
  )

  const voice =
    voiceType === 'Lukas' ? 'sk-SK-LukasNeural' : 'sk-SK-ViktoriaNeural'
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(speechFile)
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    subscriptionKey,
    serviceRegion
  )

  // SSML with Slovak language specified
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
