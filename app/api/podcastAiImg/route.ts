import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getTimeStamp } from '@/lib/timestamp'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60000, // 60 seconds timeout
})

export async function POST(req: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured')
      return NextResponse.json(
        {
          status: 'fail',
          data: 'OpenAI API key is not configured',
        },
        { status: 500 },
      )
    }

    const { title, prompt } = await req.json()

    if (!title || !prompt) {
      return NextResponse.json(
        {
          status: 'fail',
          data: 'Title and prompt are required',
        },
        { status: 400 },
      )
    }

    console.log('Starting image generation for:', title)

    const resAi = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    })

    console.log('OpenAI image generation completed')

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

    const imageUrl = resAi.data?.[0]?.url
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI')
    }

    console.log('Fetching generated image from OpenAI URL')
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch image from OpenAI: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log('Image fetched, uploading to storage...')
    const timestamp = getTimeStamp()
    const filename = `${title}_${timestamp}.png`

    const apiUrl = `${process.env.NEXT_PUBLIC_HONO_API_URL}/api/namedupload/pictusweb/${filename}`

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

    console.log('Image uploaded successfully:', frontendPath)
    return NextResponse.json({ status: 'success', data: frontendPath })
  } catch (e: any) {
    console.error('Error in image generation API:', e)
    return NextResponse.json(
      {
        status: 'fail',
        data: e.message || 'Unknown error occurred',
      },
      { status: 500 },
    )
  }
}
