import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fileUrl = searchParams.get('url')
    const filename = searchParams.get('filename')

    if (!fileUrl) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    // Fetch the file from the external URL
    const response = await fetch(fileUrl)
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: response.status })
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Determine content type based on file extension or response headers
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    
    // Set appropriate headers for download
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Length': buffer.length.toString(),
    })

    if (filename) {
      headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    }

    return new NextResponse(buffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}