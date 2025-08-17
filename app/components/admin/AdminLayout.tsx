'use client'
import React, { useState } from 'react'
import { Link } from '@/i18n/routing'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Home,
  Mic,
  Brain,
  Upload,
  BarChart3,
  Menu,
  X,
  Headphones,
  LogOut,
  User,
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
    },
    // {
    //   name: 'AI Services',
    //   href: '/admin/ai',
    //   icon: Brain,
    // },
    {
      name: 'Create Podcast',
      href: '/admin/audio',
      icon: Mic,
    },
    {
      name: 'File Upload',
      href: '/admin/file-upload',
      icon: Upload,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: User,
    },
  ]

  const isActivePath = (href: string) => {
    if (href === '/admin') {
      return pathname === '/en/admin' || pathname === '/sk/admin' || pathname === '/hu/admin'
    }
    return pathname.includes(href)
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/', redirect: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Headphones size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Pictusweb</h1>
                  <p className="text-xs text-gray-400 hidden sm:block">Admin Panel</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon
                      className={`mr-2 h-4 w-4 transition-colors ${
                        isActive ? 'text-blue-400' : 'text-gray-400'
                      }`}
                    />
                    <span className="hidden lg:block">{item.name}</span>
                    <span className="lg:hidden">{item.name.split(' ')[0]}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Back to Website - Desktop */}
              <Link
                href="/"
                className="hidden sm:flex items-center text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <Home className="mr-2 h-4 w-4" />
                <span className="hidden lg:block">Back to Website</span>
              </Link>

              {/* Logout - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden lg:block">Logout</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/5 backdrop-blur-xl border-t border-white/10">
            <nav className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 transition-colors ${
                        isActive ? 'text-blue-400' : 'text-gray-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}

              {/* Mobile Back to Website */}
              <Link
                href="/"
                className="flex items-center px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors border-t border-white/10 mt-4 pt-4"
              >
                <Home className="mr-3 h-5 w-5" />
                Back to Website
              </Link>

              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-3 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

export default AdminLayout
