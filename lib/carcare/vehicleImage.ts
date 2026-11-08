import { uploadAuthHeaders } from '@/lib/uploadTokenClient'

// Uploads a vehicle image through the hono service (the same /api/upload/fleetsync endpoint
// used by the add-vehicle flow) and returns the stored image URL.
export async function uploadVehicleImage(file: File, organization?: string): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  if (organization) fd.append('organization', organization)
  const res = await fetch(`${process.env.NEXT_PUBLIC_HONO_API_URL}/api/upload/fleetsync`, {
    method: 'POST',
    body: fd,
    headers: await uploadAuthHeaders('fleetsync'),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.message || 'upload failed')
  }
  const data = await res.json()
  return data.imageUrl as string
}
