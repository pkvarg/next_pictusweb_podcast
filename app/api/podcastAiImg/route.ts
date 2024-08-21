import { NextRequest, NextResponse } from 'next/server'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import { Readable } from 'stream'
import { getTimeStamp } from '@/lib/timestamp'

const openai = new OpenAI()

function readableStreamToNodeReadable(
  readableStream: ReadableStream
): Readable {
  const reader = readableStream.getReader()
  const nodeReadable = new Readable({
    async read() {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          this.push(null)
          break
        }
        this.push(value)
      }
    },
  })
  return nodeReadable
}

export async function POST(req: NextRequest) {
  const { title, prompt } = await req.json()

  console.log('fff', title, prompt)

  try {
    const resAi = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
    })
    // const resAi = {
    //   created: 1722692156,
    //   data: [
    //     {
    //       revised_prompt:
    //         "A cute young woman with Asian descent. She has brilliant black hair, the strands cascading down onto her shoulders. Her eyes are bright, full of life and youthful vigor. She's wearing casual attire - a fashionable tee and jeans. Her appearance is charming and youthful, radiating positive energy and enthusiasm.",
    //       url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-yUXpJ5lgEtEMjrSDkrhICtFZ/user-KmNuonVNPRABI2vtwBX3BnZL/img-giJK9uzBgIiy5s2bNMmotGWQ.png?st=2024-08-03T12%3A35%3A56Z&se=2024-08-03T14%3A35%3A56Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-08-02T23%3A19%3A18Z&ske=2024-08-03T23%3A19%3A18Z&sks=b&skv=2023-11-03&sig=8Bv7RcmS4NlWNam/vEaj2MNp5lopkyhzbGYw6s5Cxmw%3D',
    //     },
    //   ],
    // }

    const imageUrl = resAi.data[0].url
    const response = imageUrl && (await fetch(imageUrl))
    const buffer = response && (await response.arrayBuffer())

    const timestamp = getTimeStamp()

    const filePath = path.resolve(
      `./public/podcast/images/${title}_${timestamp}.png`
    )

    const frontendPath = `/podcast/images/${title}_${timestamp}.png`

    console.log('frontP', frontendPath)

    buffer &&
      fs.writeFile(filePath, Buffer.from(buffer), (err) => {
        if (err) {
          console.error('Error saving image:', err)
        } else {
          console.log('Image saved successfully to', filePath)
        }
      })

    return NextResponse.json({ status: 'success', data: frontendPath })
  } catch (e: any) {
    console.error('Error saving image:', e)
    return NextResponse.json({ status: 'fail', data: e.message })
  }
}
