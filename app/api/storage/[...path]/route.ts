import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  const filePath = path.join(process.cwd(), 'public/storage', ...resolvedParams.path)

  try {
    const file = fs.readFileSync(filePath)
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })
  } catch (error) {
    return new NextResponse('File Not Found', { status: 404 })
  }
}
