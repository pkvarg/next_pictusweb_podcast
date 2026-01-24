'use client'
import React from 'react'
import { Link } from '@/i18n/routing'
import { Mic, Brain, Upload, Eye, Bot, Mail, TrendingUp, Plus, Activity, BarChart3 } from 'lucide-react'
import Counter from './Counter'
import RefreshButton from './RefreshButton'

const AdminDashboard = () => {
  const quickActions = [
    {
      title: 'Create New Podcast',
      description: 'Generate AI podcast from text',
      href: '/admin/audio',
      icon: Mic,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
    },
    // {
    //   title: 'AI Services',
    //   description: 'Manage AI configurations',
    //   href: '/admin/ai',
    //   icon: Brain,
    //   color: 'from-purple-500 to-pink-600',
    //   bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
    // },
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
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
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
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Eye className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Bot Visits</p>
                <p className="text-2xl font-semibold text-white">--</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Bot className="h-6 w-6 text-purple-400" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Recent Activity Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Podcasts</h2>
          <Link
            href="/admin/audio"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
          >
            <span>View all</span>
            <TrendingUp className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Podcast Management</h3>
              <p className="text-gray-400 mb-4">Your recent podcasts will appear here</p>
              <Link
                href="/admin/audio"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Podcast
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
