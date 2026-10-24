import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

// AES-256-GCM helpers for secrets we must read back (e.g. a PicDocs org's Doklado API key, which
// pictusweb reuses to call Doklado — so it is encrypted at rest, NOT hashed).
//
// The key is read from PICDOCS_ENC_KEY (base64-encoded 32 bytes, server only, never NEXT_PUBLIC_).
// encrypt() returns a self-contained string "iv:tag:ciphertext", each part base64; decrypt() reverses it.
//
// Generate a key once with:  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
// and set PICDOCS_ENC_KEY in the app env.

const IV_LENGTH = 12 // 96-bit nonce, recommended for GCM

function getKey(): Buffer {
  const b64 = process.env.PICDOCS_ENC_KEY
  if (!b64) throw new Error('PICDOCS_ENC_KEY is not set')
  const key = Buffer.from(b64, 'base64')
  if (key.length !== 32) throw new Error('PICDOCS_ENC_KEY must be 32 bytes (base64-encoded)')
  return key
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`
}

export function decrypt(encoded: string): string {
  const key = getKey()
  const [ivB64, tagB64, dataB64] = encoded.split(':')
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Malformed ciphertext')
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
  const plaintext = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()])
  return plaintext.toString('utf8')
}
