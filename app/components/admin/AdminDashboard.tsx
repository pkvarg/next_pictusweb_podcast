'use client'
import React from 'react'
import { Link } from '@/i18n/routing'
import { Upload, Eye, Bot, Mail, Plus, BarChart3, Mic, Building, User, Car } from 'lucide-react'
import Counter from './Counter'
import RefreshButton from './RefreshButton'

const AdminDashboard = () => {
  const quickActions = [
    {
      title: 'Manage Podcasts',
      description: 'View and create AI podcasts',
      href: '/admin/podcasts',
      icon: Mic,
      color: 'from-pictus-lime to-pictus-lime600',
      bgColor: 'bg-pictus-lime/10 hover:bg-pictus-lime/20',
    },
    {
      title: 'Organizations',
      description: 'Manage organizations',
      href: '/admin/organizations',
      icon: Building,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    },
    {
      title: 'Users',
      description: 'Manage user accounts',
      href: '/admin/users',
      icon: User,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    },
    {
      title: 'Vehicle Notifications',
      description: 'Manage fleet notifications',
      href: '/admin/vehicle-notifications',
      icon: Car,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
    },
    {
      title: 'Upload Files',
      description: 'Manage media files',
      href: '/admin/file-upload',
      icon: Upload,
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-500/10 hover:bg-green-500/20',
    },
    {
      title: 'Analytics Dashboard',
      description: 'View Metabase analytics',
      href: '/admin/dashboard',
      icon: BarChart3,
      color: 'from-pictus-lime to-pictus-lime600',
      bgColor: 'bg-pictus-lime/10 hover:bg-pictus-lime/20',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-gray-400">
            Welcome back! Here&apos;s what&apos;s happening with your podcasts.
          </p>
        </div>
        <RefreshButton />
      </div>

      {/* Stats Cards */}
      {process.env.NODE_ENV !== 'development' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Visitors</p>
                <div className="mt-2">
                  <Counter />
                </div>
              </div>
              <div className="p-3 bg-pictus-lime/20 rounded-lg">
                <Eye className="h-6 w-6 text-pictus-lime" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Bot Visits</p>
                <p className="text-2xl font-semibold text-white">--</p>
              </div>
              <div className="p-3 bg-pictus-lime/20 rounded-lg">
                <Bot className="h-6 w-6 text-pictus-lime" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Email Inquiries</p>
                <p className="text-2xl font-semibold text-white">--</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                href={action.href}
                className={`group p-6 rounded-xl border border-white/10 transition-all duration-200 ${action.bgColor} hover:border-white/20 hover:scale-105`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white group-hover:text-white">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">{action.description}</p>
                  </div>
                  <Plus className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default AdminDashboard
