import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import { pipeline, Readable } from 'stream'
import { promisify } from 'util'
import { getTimeStamp } from '@/lib/timestamp'
//import { CloudCog } from 'lucide-react'
//import { log } from 'console'
//import { uploadFirebase } from '@/app/[locale]/admin/_actions/uploadToFirebase'
//const pump = promisify(pipeline)

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
  try {
    const formData = await req.formData()
    const fileEntry = formData.getAll('file')[0]

    // Type guard to ensure fileEntry is a File
    if (fileEntry && fileEntry instanceof File) {
      const timestamp = getTimeStamp()

      const apiUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3013/api/upload/pictusweb'
          : 'https://hono-api.pictusweb.com/api/upload/pictusweb'

      //console.log('apiUrl', apiUrl)

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      })

      // console.log('response', response)

      if (!response.ok) {
        throw new Error('Nepodarilo sa nahrať súbor')
      }

      const data = await response.json()

      //console.log('data', data)

      const frontendPath = data.imageUrl

      // const fileName = `${timestamp}_${fileEntry.name}`
      // const filePath = `public/storage/podcast_images/${fileName}`
      // const frontendPath = `/storage/podcast_images/${fileName}`

      // const nodeReadableStream = readableStreamToNodeReadable(fileEntry.stream())

      // // Ensure the directory exists before writing the file
      // fs.mkdirSync('public/storage/podcast_images', { recursive: true })

      // // Save the file
      // await pump(nodeReadableStream, fs.createWriteStream(filePath))

      // const contentType = 'image/webp'

      // If using Firebase, uncomment:
      // const frontendPath = await uploadFirebase(fileName, fileEntry, contentType);

      //console.log('frontendPath', frontendPath)

      return NextResponse.json({ status: 'success', data: frontendPath })
    } else {
      throw new Error('The provided form data entry is not a file.')
    }
  } catch (e: any) {
    return NextResponse.json({ status: 'fail', data: e.message })
  }
}
