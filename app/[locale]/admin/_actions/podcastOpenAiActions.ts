'use server'
import { getTimeStamp } from '@/lib/timestamp'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { uploadFirebase } from './uploadToFirebase'

const openai = new OpenAI()

export async function createOpenAiSpeech(podcastTitle: string, voiceType: any, inputText: string) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voiceType,
      input: inputText,
    })

    const timestamp = getTimeStamp()

    // **** change paths!!!!

    const fileName = `${podcastTitle}_${timestamp}.mp3`
    const speechFile = path.resolve(`public/storage/mp3s/${fileName}`)

    // Ensure the directory exists before writing the file
    fs.mkdirSync(path.dirname(speechFile), { recursive: true })

    // Convert ArrayBuffer to Uint8Array for compatibility with fs.writeFile
    const buffer = new Uint8Array(await mp3.arrayBuffer())

    // Write the MP3 file
    await fs.promises.writeFile(speechFile, buffer)

    const contentType = 'audio/mpeg'

    // Upload to Firebase (if needed)
    const frontendPath = await uploadFirebase(podcastTitle, buffer, contentType)

    return { frontendPath }

    // const speechFile = path.resolve(
    //   `./storage/mp3s/${podcastTitle}_${timestamp}.mp3`
    // )

    // const buffer = Buffer.from(await mp3.arrayBuffer())

    // // *** implement upload to Firebase external function to be used for all providers
    // await fs.promises.writeFile(speechFile, buffer)

    // const contentType = 'audio/mpeg'

    // const frontendPath = await uploadFirebase(podcastTitle, buffer, contentType)

    // return { frontendPath } // Return the Firebase URL
  } catch (error) {
    console.log(error)
  }
}
