// Browser side: fetches an upload token from /api/upload-token and reuses it until shortly before it expires.
type Target = 'pictusweb' | 'fleetsync'

const tokenRequests: Partial<Record<Target, Promise<{ token: string; expiresAt: number }>>> = {}

const requestUploadToken = async (target: Target) => {
  const response = await fetch('/api/upload-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target }),
  })
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? 'Prihlásenie vypršalo. Prihláste sa znova a nahrajte súbor ešte raz.'
        : `Nepodarilo sa získať povolenie na nahrávanie (HTTP ${response.status}).`,
    )
  }
  return (await response.json()) as { token: string; expiresAt: number }
}

export const uploadAuthHeaders = async (target: Target): Promise<Record<string, string>> => {
  const pending = tokenRequests[target]
  const current = pending ? await pending.catch(() => null) : null
  if (current && current.expiresAt - 60_000 > Date.now()) {
    return { Authorization: `Bearer ${current.token}` }
  }
  const request = requestUploadToken(target)
  tokenRequests[target] = request
  try {
    return { Authorization: `Bearer ${(await request).token}` }
  } catch (err) {
    delete tokenRequests[target]
    throw err
  }
}
