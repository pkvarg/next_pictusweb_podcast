import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/lib/userApiAccess', () => ({ resolveUserApiAccess: vi.fn() }))
vi.mock('@/lib/sameOrigin', () => ({ sameOriginOk: vi.fn(() => true) }))
vi.mock('@/lib/checkIPBan', () => ({
  checkIPBan: vi.fn().mockResolvedValue({ isBanned: false }),
}))
vi.mock('@/lib/tier-limits', () => ({
  checkTierLimit: vi.fn().mockResolvedValue(undefined),
  TierLimitError: class TierLimitError extends Error {},
}))
vi.mock('@/lib/isValidPassword', () => ({ hashPassword: vi.fn().mockResolvedValue('hashed') }))
vi.mock('@/db/db', () => ({
  default: {
    user: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      create: vi.fn().mockResolvedValue({ id: 'new-user' }),
      update: vi.fn().mockResolvedValue({ id: 'u1' }),
    },
  },
}))

import prisma from '@/db/db'
import { resolveUserApiAccess } from '@/lib/userApiAccess'
import { GET, POST } from '@/app/api/users/route'
import { GET as getById, PUT, DELETE } from '@/app/api/users/[id]/route'

const access = vi.mocked(resolveUserApiAccess)
const db = prisma as unknown as {
  user: {
    findMany: ReturnType<typeof vi.fn>
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
}

const ADMIN = { isAdmin: true, organizationId: null }
const CLIENT = { isAdmin: false, organizationId: 'org1' }

const req = (url: string, init?: RequestInit) => new Request(url, init) as any
const params = (id: string) => ({ params: Promise.resolve({ id }) })

beforeEach(() => {
  vi.clearAllMocks()
  db.user.findMany.mockResolvedValue([])
  db.user.create.mockResolvedValue({ id: 'new-user' })
  db.user.update.mockResolvedValue({ id: 'u1' })
})

describe('GET /api/users', () => {
  it('rejects an unauthenticated caller', async () => {
    access.mockResolvedValue(null)
    const res = await GET(req('http://localhost/api/users'))
    expect(res.status).toBe(403)
    expect(db.user.findMany).not.toHaveBeenCalled()
  })

  it('lets an admin honor the requested organizationId', async () => {
    access.mockResolvedValue(ADMIN)
    const res = await GET(req('http://localhost/api/users?organizationId=org2'))
    expect(res.status).toBe(200)
    expect(db.user.findMany.mock.calls[0][0].where.organizationId).toBe('org2')
  })

  it('forces a client to its own org even when another org is requested', async () => {
    access.mockResolvedValue(CLIENT)
    const res = await GET(req('http://localhost/api/users?organizationId=org2'))
    expect(res.status).toBe(200)
    expect(db.user.findMany.mock.calls[0][0].where.organizationId).toBe('org1')
  })

  it('scopes a client with no organizationId to its own org', async () => {
    access.mockResolvedValue(CLIENT)
    const res = await GET(req('http://localhost/api/users'))
    expect(res.status).toBe(200)
    expect(db.user.findMany.mock.calls[0][0].where.organizationId).toBe('org1')
  })
})

describe('POST /api/users', () => {
  const body = (extra: Record<string, unknown>) =>
    req('http://localhost/api/users', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.sk', firstName: 'A', lastName: 'B', ...extra }),
    })

  it('rejects an unauthenticated caller', async () => {
    access.mockResolvedValue(null)
    const res = await POST(body({ organizationId: 'org2' }))
    expect(res.status).toBe(403)
    expect(db.user.create).not.toHaveBeenCalled()
  })

  it('forces a client create into its own org', async () => {
    access.mockResolvedValue(CLIENT)
    const res = await POST(body({ organizationId: 'org2', isBenefit: false }))
    expect(res.status).toBe(201)
    expect(db.user.create.mock.calls[0][0].data.organizationId).toBe('org1')
  })

  it('lets an admin create in any org', async () => {
    access.mockResolvedValue(ADMIN)
    const res = await POST(body({ organizationId: 'org2', isBenefit: false }))
    expect(res.status).toBe(201)
    expect(db.user.create.mock.calls[0][0].data.organizationId).toBe('org2')
  })
})

describe('GET /api/users/[id]', () => {
  it('rejects an unauthenticated caller', async () => {
    access.mockResolvedValue(null)
    const res = await getById(req('http://localhost/api/users/u1'), params('u1'))
    expect(res.status).toBe(403)
  })

  it('blocks a client from reading another org’s user', async () => {
    access.mockResolvedValue(CLIENT)
    db.user.findUnique.mockResolvedValue({ id: 'u1', organizationId: 'org2' })
    const res = await getById(req('http://localhost/api/users/u1'), params('u1'))
    expect(res.status).toBe(403)
  })

  it('lets a client read its own org’s user', async () => {
    access.mockResolvedValue(CLIENT)
    db.user.findUnique.mockResolvedValue({ id: 'u1', organizationId: 'org1' })
    const res = await getById(req('http://localhost/api/users/u1'), params('u1'))
    expect(res.status).toBe(200)
  })
})

describe('PUT /api/users/[id]', () => {
  const put = (extra: Record<string, unknown>) =>
    req('http://localhost/api/users/u1', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(extra),
    })

  it('blocks a client from editing another org’s user', async () => {
    access.mockResolvedValue(CLIENT)
    db.user.findUnique.mockResolvedValue({ organizationId: 'org2' })
    const res = await PUT(put({ firstName: 'X' }), params('u1'))
    expect(res.status).toBe(403)
    expect(db.user.update).not.toHaveBeenCalled()
  })

  it('does not let a client move a user to another org', async () => {
    access.mockResolvedValue(CLIENT)
    db.user.findUnique.mockResolvedValue({ organizationId: 'org1' })
    const res = await PUT(put({ firstName: 'X', organizationId: 'org2' }), params('u1'))
    expect(res.status).toBe(200)
    expect(db.user.update.mock.calls[0][0].data.organizationId).toBeUndefined()
  })

  it('lets an admin move a user to another org', async () => {
    access.mockResolvedValue(ADMIN)
    db.user.findUnique.mockResolvedValue({ organizationId: 'org1' })
    const res = await PUT(put({ organizationId: 'org2' }), params('u1'))
    expect(res.status).toBe(200)
    expect(db.user.update.mock.calls[0][0].data.organizationId).toBe('org2')
  })
})

describe('DELETE /api/users/[id]', () => {
  it('blocks a client from deleting another org’s user', async () => {
    access.mockResolvedValue(CLIENT)
    db.user.findUnique.mockResolvedValue({ organizationId: 'org2' })
    const res = await DELETE(
      req('http://localhost/api/users/u1', { method: 'DELETE' }),
      params('u1'),
    )
    expect(res.status).toBe(403)
    expect(db.user.update).not.toHaveBeenCalled()
  })

  it('lets a client soft-delete its own org’s user', async () => {
    access.mockResolvedValue(CLIENT)
    db.user.findUnique.mockResolvedValue({ organizationId: 'org1' })
    const res = await DELETE(
      req('http://localhost/api/users/u1', { method: 'DELETE' }),
      params('u1'),
    )
    expect(res.status).toBe(200)
    expect(db.user.update.mock.calls[0][0].data.deletedAt).toBeInstanceOf(Date)
  })
})
