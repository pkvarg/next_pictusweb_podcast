'use server'
import { getTimeStamp } from '@/lib/timestamp'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { uploadFirebase } from './uploadToFirebase'

const openai = new OpenAI()

export async function createOpenAiSpeech(
  podcastTitle: string,
  voiceType: any,
  inputText: string
) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voiceType,
      input: inputText,
    })

    const timestamp = getTimeStamp()

    // **** change paths!!!!

    const speechFile = path.resolve(
      `./storage/mp3s/${podcastTitle}_${timestamp}.mp3`
    )

    const buffer = Buffer.from(await mp3.arrayBuffer())

    // *** implement upload to Firebase external function to be used for all providers
    await fs.promises.writeFile(speechFile, buffer)

    const contentType = 'audio/mpeg'

    const frontendPath = await uploadFirebase(podcastTitle, buffer, contentType)

    return { frontendPath } // Return the Firebase URL
  } catch (error) {
    console.log(error)
  }
}
