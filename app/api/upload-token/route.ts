import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { fleetsyncOrgFolder, signUploadToken } from '@/lib/uploadToken'

// Issues an upload token for the hono API: podcast media for admins, vehicle photos for
// any signed-in fleet user, limited to their own organization's folder.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const target = body?.target === 'fleetsync' ? 'fleetsync' : 'pictusweb'

  let signed
  if (target === 'fleetsync') {
    const organization = session.user.organization
    if (!organization) {
      return NextResponse.json({ error: 'No organization' }, { status: 403 })
    }
    signed = signUploadToken('fleetsync', fleetsyncOrgFolder(organization))
  } else {
    const role = session.user.role
    if (role !== 'ADMIN' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    signed = signUploadToken('pictusweb')
  }

  if (!signed) {
    console.error('PICTUSWEB_UPLOAD_SECRET is not set')
    return NextResponse.json({ error: 'Upload is not configured' }, { status: 500 })
  }

  return NextResponse.json(signed)
}
