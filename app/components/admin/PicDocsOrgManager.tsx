'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Plus, Edit2, Save, X, Users, ChevronDown, ChevronRight, KeyRound } from 'lucide-react'

interface PicDocsOrgSummary {
  organizationId: string
  name: string
  dokladoOrganizationId: string
  recipientEmail: string
  hasDokladoKey: boolean
  userCount: number
  lastRunAt: string | null
}

interface PicDocsUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  active: boolean
  createdAt: string
  lastLoggedIn: string | null
}

const inputClass = 'px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white w-full'
const labelClass = 'text-xs text-gray-400 mb-1 block'

export default function PicDocsOrgManager() {
  const [orgs, setOrgs] = useState<PicDocsOrgSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<any>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchOrgs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/picdocs/orgs')
      if (res.ok) {
        const data = await res.json()
        setOrgs(data.orgs || [])
      }
    } catch (error) {
      console.error('Failed to fetch PicDocs orgs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrgs()
  }, [fetchOrgs])

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/picdocs/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          dokladoOrganizationId: newItem.dokladoOrganizationId,
          recipientEmail: newItem.recipientEmail,
          dokladoApiKey: newItem.dokladoApiKey || '',
        }),
      })
      if (res.ok) {
        setNewItem(null)
        fetchOrgs()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Failed to create PicDocs org')
      }
    } catch (error) {
      console.error('Failed to create PicDocs org:', error)
      alert('Error creating PicDocs org')
    }
  }

  const handleSaveEdit = async (orgId: string) => {
    try {
      const payload: any = {
        recipientEmail: editItem.recipientEmail,
        dokladoOrganizationId: editItem.dokladoOrganizationId,
      }
      // Only send the key field when the admin typed something (blank = keep current).
      if (editItem.dokladoApiKey && editItem.dokladoApiKey.length > 0) {
        payload.dokladoApiKey = editItem.dokladoApiKey
      }
      const res = await fetch(`/api/admin/picdocs/orgs/${orgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setEditingId(null)
        setEditItem(null)
        fetchOrgs()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Failed to update PicDocs org')
      }
    } catch (error) {
      console.error('Failed to update PicDocs org:', error)
      alert('Error updating PicDocs org')
    }
  }

  const handleClearKey = async (orgId: string) => {
    if (!confirm('Remove this org’s Doklado key? Runs will be disabled until a new key is set.')) {
      return
    }
    try {
      const res = await fetch(`/api/admin/picdocs/orgs/${orgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dokladoApiKey: '' }),
      })
      if (res.ok) {
        fetchOrgs()
      } else {
        alert('Failed to clear Doklado key')
      }
    } catch (error) {
      console.error('Failed to clear Doklado key:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-xl">
            <FileText className="h-6 w-6 text-pictus-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">PicDocs Organizations</h1>
            <p className="text-sm text-gray-400">
              Accounting-document orgs, their Doklado target, and their users.
            </p>
          </div>
        </div>
        {!newItem && (
          <button
            onClick={() =>
              setNewItem({ name: '', dokladoOrganizationId: '', recipientEmail: '', dokladoApiKey: '' })
            }
            className="flex items-center gap-2 px-4 py-2 bg-pictus-lime text-pictus-black rounded-lg font-semibold hover:bg-pictus-lime600 transition-all"
          >
            <Plus className="h-4 w-4" /> New PicDocs org
          </button>
        )}
      </div>

      {/* Create form */}
      {newItem && (
        <div className="bg-gradient-to-br from-pictus-onyx900/30 to-pictus-black/50 rounded-xl p-6 border border-pictus-lime/30">
          <h2 className="text-lg font-semibold text-white mb-4">New PicDocs organization</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                className={inputClass}
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g. janbartek"
              />
            </div>
            <div>
              <label className={labelClass}>Doklado organization ID (IČO)</label>
              <input
                className={inputClass}
                value={newItem.dokladoOrganizationId}
                maxLength={50}
                onChange={(e) => setNewItem({ ...newItem, dokladoOrganizationId: e.target.value })}
                placeholder="e.g. 54631068"
              />
            </div>
            <div>
              <label className={labelClass}>Recipient email</label>
              <input
                className={inputClass}
                type="email"
                value={newItem.recipientEmail}
                onChange={(e) => setNewItem({ ...newItem, recipientEmail: e.target.value })}
                placeholder="where results are emailed"
              />
            </div>
            <div>
              <label className={labelClass}>Doklado API key</label>
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                value={newItem.dokladoApiKey}
                onChange={(e) => setNewItem({ ...newItem, dokladoApiKey: e.target.value })}
                placeholder="the organization's own Doklado API key"
              />
              <p className="text-xs text-gray-500 mt-1">
                The organization&apos;s own Doklado API key. Can be added later, but runs are disabled
                until a key is set.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-pictus-lime text-pictus-black rounded-lg font-semibold hover:bg-pictus-lime600 transition-all"
            >
              <Save className="h-4 w-4" /> Create
            </button>
            <button
              onClick={() => setNewItem(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : orgs.length === 0 ? (
        <p className="text-gray-400">No PicDocs organizations yet.</p>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => {
            const isEditing = editingId === org.organizationId
            const isExpanded = expandedId === org.organizationId
            return (
              <div
                key={org.organizationId}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-pictus-lime/30 transition-all"
              >
                {isEditing ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Doklado organization ID (IČO)</label>
                      <input
                        className={inputClass}
                        value={editItem.dokladoOrganizationId}
                        maxLength={50}
                        onChange={(e) =>
                          setEditItem({ ...editItem, dokladoOrganizationId: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Recipient email</label>
                      <input
                        className={inputClass}
                        type="email"
                        value={editItem.recipientEmail}
                        onChange={(e) =>
                          setEditItem({ ...editItem, recipientEmail: e.target.value })
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Rotate Doklado API key</label>
                      <input
                        className={inputClass}
                        type="password"
                        autoComplete="new-password"
                        value={editItem.dokladoApiKey}
                        onChange={(e) => setEditItem({ ...editItem, dokladoApiKey: e.target.value })}
                        placeholder="leave blank to keep the current key"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank to keep the current key. Current:{' '}
                        {org.hasDokladoKey ? 'own key' : 'no key (runs disabled)'}.
                      </p>
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(org.organizationId)}
                        className="flex items-center gap-2 px-4 py-2 bg-pictus-lime text-pictus-black rounded-lg font-semibold hover:bg-pictus-lime600 transition-all"
                      >
                        <Save className="h-4 w-4" /> Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditItem(null)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            org.hasDokladoKey
                              ? 'bg-pictus-lime/15 border-pictus-lime/40 text-pictus-lime'
                              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                          }`}
                        >
                          key: {org.hasDokladoKey ? 'set' : 'none — runs disabled'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Doklado org: <span className="text-gray-200">{org.dokladoOrganizationId}</span>{' '}
                        · Recipient: <span className="text-gray-200">{org.recipientEmail}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {org.userCount} user{org.userCount === 1 ? '' : 's'} · Last run:{' '}
                        {org.lastRunAt ? new Date(org.lastRunAt).toLocaleString() : 'never'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : org.organizationId)
                        }
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all text-sm"
                      >
                        <Users className="h-4 w-4" />
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {org.hasDokladoKey && (
                        <button
                          onClick={() => handleClearKey(org.organizationId)}
                          title="Remove key (runs disabled until a new key is set)"
                          className="flex items-center gap-1 px-3 py-1.5 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all text-sm"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingId(org.organizationId)
                          setEditItem({
                            dokladoOrganizationId: org.dokladoOrganizationId,
                            recipientEmail: org.recipientEmail,
                            dokladoApiKey: '',
                          })
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all text-sm"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {isExpanded && !isEditing && (
                  <OrgUsers orgId={org.organizationId} onChange={fetchOrgs} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function OrgUsers({ orgId, onChange }: { orgId: string; onChange: () => void }) {
  const [users, setUsers] = useState<PicDocsUser[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '' })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/picdocs/orgs/${orgId}/users`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch org users:', error)
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleAdd = async () => {
    try {
      const res = await fetch(`/api/admin/picdocs/orgs/${orgId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setForm({ email: '', firstName: '', lastName: '', password: '' })
        setAdding(false)
        fetchUsers()
        onChange()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      alert('Error creating user')
    }
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">Users</h4>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-pictus-lime text-pictus-black rounded-lg text-sm font-semibold hover:bg-pictus-lime600 transition-all"
          >
            <Plus className="h-4 w-4" /> Add user
          </button>
        )}
      </div>

      {adding && (
        <div className="grid md:grid-cols-2 gap-3 mb-4 bg-white/5 rounded-lg p-3 border border-white/10">
          <div>
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <input
              className={inputClass}
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="at least 8 characters"
            />
          </div>
          <div>
            <label className={labelClass}>First name</label>
            <input
              className={inputClass}
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input
              className={inputClass}
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-pictus-lime text-pictus-black rounded-lg font-semibold hover:bg-pictus-lime600 transition-all"
            >
              <Save className="h-4 w-4" /> Create user
            </button>
            <button
              onClick={() => {
                setAdding(false)
                setForm({ email: '', firstName: '', lastName: '', password: '' })
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-sm">No users yet.</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10"
            >
              <div className="min-w-0">
                <p className="text-sm text-white truncate">
                  {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email}
                </p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  u.active
                    ? 'bg-pictus-lime/15 border-pictus-lime/40 text-pictus-lime'
                    : 'bg-white/5 border-white/15 text-gray-400'
                }`}
              >
                {u.active ? 'active' : 'inactive'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
