import { NextRequest, NextResponse } from 'next/server'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import { Readable } from 'stream'
import { getTimeStamp } from '@/lib/timestamp'

const openai = new OpenAI()

function readableStreamToNodeReadable(readableStream: ReadableStream): Readable {
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

  try {
    const resAi = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
    })

    // const resAi = {
    //   created: 1745045031,
    //   data: [
    //     {
    //       revised_prompt:
    //         'A close-up image of an elegant gold ring placed upon a black velvet cushion. The ring is richly engraved with intricate designs and sparkles with a large, clear diamond that catches the light beautifully. The diamond is cut in an exquisite round brilliant shape. The box that holds the cushion is made out of dark mahogany wood, adding a touch of sophistication to the overall scene.',
    //       url: 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-yUXpJ5lgEtEMjrSDkrhICtFZ/user-KmNuonVNPRABI2vtwBX3BnZL/img-UWUKcxAmUMHpXwYh1eX67J8Q.png?st=2025-04-19T05%3A43%3A51Z&se=2025-04-19T07%3A43%3A51Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=cc612491-d948-4d2e-9821-2683df3719f5&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-19T06%3A43%3A51Z&ske=2025-04-20T06%3A43%3A51Z&sks=b&skv=2024-08-04&sig=ZxfO2Sx71N30dT7khAw2m/aOn5lvqU%2BVO5zpB79fwOA%3D',
    //     },
    //   ],
    // }

    const imageUrl = resAi.data[0]?.url
    const response = imageUrl ? await fetch(imageUrl) : null
    const arrayBuffer = response ? await response.arrayBuffer() : null

    if (arrayBuffer) {
      const timestamp = getTimeStamp()
      const filename = `${title}_${timestamp}.png`

      // const apiUrl =
      //   process.env.NODE_ENV === 'development'
      //     ? `http://localhost:3013/api/namedupload/pictusweb/${filename}`
      //     : `https://hono-api.pictusweb.com/api/namedupload/pictusweb/${filename}`
      const apiUrl = `https://hono-api.pictusweb.com/api/namedupload/pictusweb/${filename}`

      // Send the raw arrayBuffer directly instead of using FormData
      const uploadResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
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

      const frontendPath = data.imageUrl

      console.log('front', frontendPath)

      // const filePath = path.resolve(`public/storage/podcast_images/${fileName}`)
      // const frontendPath = `/storage/podcast_images/${fileName}`

      // // Ensure the directory exists
      // fs.mkdirSync(path.dirname(filePath), { recursive: true })

      // // Convert ArrayBuffer to Buffer
      // const buffer = new Uint8Array(arrayBuffer)

      // // Write file to the public directory
      // fs.writeFile(filePath, buffer, (err) => {
      //   if (err) {
      //     console.error('Error saving image:', err)
      //   } else {
      //     console.log('Image saved successfully to', filePath)
      //   }
      // })

      // If using Firebase, uncomment this:
      // const frontendPath = await uploadFirebase(title, buffer, contentType);

      return NextResponse.json({ status: 'success', data: frontendPath })
    }
  } catch (e: any) {
    console.error('Error saving image:', e)
    return NextResponse.json({ status: 'fail', data: e.message })
  }
}
