'use client'
import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Mail,
  Building,
  UserCheck,
  UserX,
  Search,
  Shield,
  Phone,
  Gift,
} from 'lucide-react'
import CreateUserModal from './CreateUserModal'
import EditUserModal from './EditUserModal'
import DeleteUserModal from './DeleteUserModal'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  organization: string | null
  organizationId: string | null
  organizationRelation?: {
    id: string
    name: string
  }
  active: boolean
  isFleetManager: boolean
  isBenefit?: boolean
  role: string
  password: string | null
  loginProvider: string | null
  createdAt: string
  updatedAt: string
}

export default function AllUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    const orgName = user.organizationRelation?.name || user.organization || ''
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchLower)) ||
      (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchLower)) ||
      orgName.toLowerCase().includes(searchLower)
    )
  })

  const handleUserCreated = () => {
    fetchUsers()
    setIsCreateModalOpen(false)
  }

  const handleUserUpdated = () => {
    fetchUsers()
    setEditingUser(null)
  }

  const handleUserDeleted = () => {
    fetchUsers()
    setDeletingUser(null)
  }

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12">
        <div className="text-center">
          <div className="animate-spin mx-auto w-16 h-16 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-pictus-black" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Users...</h3>
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-12">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-pictus-lime to-pictus-lime600 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-pictus-black" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
          <p className="text-gray-400 mb-6">Create your first user to get started</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black text-[14px] font-normal rounded-lg transition-all shadow-lg hover:shadow-pictus-lime/50 hover:from-pictus-lime400 hover:to-pictus-lime700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First User
          </button>
        </div>
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onUserCreated={handleUserCreated}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">All Users</h2>
          <p className="text-gray-400 mt-1">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pictus-lime to-pictus-lime600 text-pictus-black text-[14px] font-normal rounded-lg transition-all shadow-lg hover:shadow-pictus-lime/50 hover:from-pictus-lime400 hover:to-pictus-lime700"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by email, name, phone, or organization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pictus-lime to-pictus-lime600 flex items-center justify-center">
                          <span className="text-pictus-black font-medium text-sm">
                            {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.email
                          }
                        </div>
                        <div className="text-sm text-gray-400 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      <Building className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{user.organizationRelation?.name || user.organization || 'N/A'}</span>
                      {user.isFleetManager && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pictus-lime/20 text-pictus-lime border border-pictus-lime/30">
                          <Shield className="h-3 w-3 mr-1" />
                          Manager
                        </span>
                      )}
                      {user.isBenefit && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          <Gift className="h-3 w-3 mr-1" />
                          Benefit
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      {user.phoneNumber ? (
                        <>
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {user.phoneNumber}
                        </>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.active 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {user.active ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                      {user.active ? 'Active' : 'Inactive'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pictus-lime/20 text-pictus-lime border border-pictus-lime/30">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-pictus-lime hover:text-pictus-lime600 p-1 rounded"
                        title="Edit user"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="text-red-400 hover:text-red-300 p-1 rounded"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {editingUser && (
        <EditUserModal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          user={editingUser}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          isOpen={true}
          onClose={() => setDeletingUser(null)}
          user={deletingUser}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </div>
  )
}