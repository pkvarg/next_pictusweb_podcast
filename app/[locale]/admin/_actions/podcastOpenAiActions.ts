'use server'
import { getTimeStamp } from '@/lib/timestamp'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

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

    const frontendPath = `/podcast/mp3s/${podcastTitle}_${timestamp}.mp3`

    const speechFile = path.resolve(
      `./public/podcast/mp3s/${podcastTitle}_${timestamp}.mp3`
    )

    const buffer = Buffer.from(await mp3.arrayBuffer())
    await fs.promises.writeFile(speechFile, buffer)
    return { frontendPath }
  } catch (error) {
    console.log(error)
  }
}
