'use client'
import React, { useState } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
}

interface DeleteUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onUserDeleted: () => void
}

export default function DeleteUserModal({ isOpen, onClose, user, onUserDeleted }: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onUserDeleted()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete user')
      }
    } catch (error) {
      setError('Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-white/10 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Delete User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-white mb-2">
                Are you sure you want to delete this user?
              </h4>
              <p className="text-gray-400 mb-4">
                You are about to delete <span className="font-medium text-white">{displayName}</span>. 
                This action will soft-delete the user (set deletedAt timestamp) and cannot be easily undone.
              </p>
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-300">
                  <strong>Email:</strong> {user.email}
                </p>
                {user.firstName && user.lastName && (
                  <p className="text-sm text-gray-300">
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>{loading ? 'Deleting...' : 'Delete User'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}