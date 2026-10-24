// Minimal typed Doklado API client. pictusweb is the ONLY place the raw Doklado key is used
// (max-safety model): the key is passed in by the caller (decrypted from the per-org
// PicDocsOrg.dokladoApiKeyEnc) and is NEVER logged or put into any thrown error message.

const DOKLADO_BASE = 'https://api-gateway-prod-europe-west-1-7epuecvu.ew.gateway.dev'

// We forward documents raw to n8n/Nova — only the id field is relied on here.
export type DokladoDocument = { documentId: string } & Record<string, unknown>

interface ListResponse {
  success?: boolean
  code?: unknown
  data?: DokladoDocument[]
  searchAfter?: unknown
}

function authHeaders(apiKey: string): Record<string, string> {
  return {
    api_key: apiKey, // raw key, no Bearer prefix
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

// Lists all unexported receipt+invoice documents, following searchAfter pagination to the end.
async function listDocuments(
  apiKey: string,
  dokladoOrganizationId: string,
  isExported: boolean,
  extra: Record<string, unknown> = {},
): Promise<DokladoDocument[]> {
  const all: DokladoDocument[] = []
  let searchAfter: unknown = undefined

  // Hard page cap as a safety net against an unexpected pagination loop.
  for (let page = 0; page < 1000; page++) {
    const data: Record<string, unknown> = {
      organizationId: dokladoOrganizationId,
      isExported,
      resourceTypes: ['receipt', 'invoice'],
      ...extra,
    }
    if (searchAfter !== undefined && searchAfter !== null) {
      data.searchAfter = searchAfter
    }

    const res = await fetch(`${DOKLADO_BASE}/v2/documents`, {
      method: 'POST',
      headers: authHeaders(apiKey),
      body: JSON.stringify({ data }),
    })

    if (!res.ok) {
      throw new Error(`Doklado list failed (HTTP ${res.status})`)
    }

    const json = (await res.json()) as ListResponse
    if (json.success === false) {
      throw new Error('Doklado list returned success:false')
    }

    const batch = json.data ?? []
    all.push(...batch)

    // Stop when a page is empty or no cursor is returned.
    if (batch.length === 0 || json.searchAfter === undefined || json.searchAfter === null) {
      break
    }
    searchAfter = json.searchAfter
  }

  return all
}

export const listUnexported = (apiKey: string, dokladoOrganizationId: string) =>
  listDocuments(apiKey, dokladoOrganizationId, false)

export const listExported = (
  apiKey: string,
  dokladoOrganizationId: string,
  extra: Record<string, unknown> = {},
) => listDocuments(apiKey, dokladoOrganizationId, true, extra)

// Marks the given documents exported (status = sync_with_acc_soft).
async function setDocumentsStatus(
  apiKey: string,
  documentIds: string[],
  status: string,
): Promise<void> {
  if (documentIds.length === 0) return

  const res = await fetch(`${DOKLADO_BASE}/v2/documents/setExported`, {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify({
      data: {
        documents: documentIds.map((documentId) => ({
          documentId,
          status,
        })),
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Doklado setExported failed (HTTP ${res.status})`)
  }

  const json = (await res.json().catch(() => ({}))) as { success?: boolean }
  if (json.success === false) {
    throw new Error('Doklado setExported returned success:false')
  }
}

export const setExported = (apiKey: string, documentIds: string[]) =>
  setDocumentsStatus(apiKey, documentIds, 'sync_with_acc_soft')

export const setUnexported = (apiKey: string, documentIds: string[]) =>
  setDocumentsStatus(apiKey, documentIds, 'not_exported')
