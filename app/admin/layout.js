'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import ResponsiveSidebar from '@/components/admin/ResponsiveSidebar'
import {
  FiMenu, FiSearch, FiBell, FiChevronDown, FiLogOut, FiUser,
  FiSettings, FiMessageSquare, FiExternalLink
} from 'react-icons/fi'

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newEnquiries, setNewEnquiries] = useState(0)
  const [recentEnquiries, setRecentEnquiries] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const breakpoint = useBreakpoint()
  const notifRef = useRef(null)
  const profileRef = useRef(null)

  // Determine sidebar mode based on breakpoint
  const sidebarMode = breakpoint === 'mobile' ? 'hidden'
    : breakpoint === 'tablet' ? 'collapsed'
    : 'expanded'

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdowns on route change
  useEffect(() => {
    setNotifOpen(false)
    setProfileOpen(false)
  }, [pathname])

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setUser(data.user)
      // Fetch dashboard data
      const dashRes = await fetch('/api/admin/dashboard')
      if (dashRes.ok) {
        const dash = await dashRes.json()
        setNewEnquiries(dash.stats?.newEnquiries || 0)
        setRecentEnquiries(dash.recentEnquiries || [])
      }
    } catch {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    setProfileOpen(false)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  // Login page - no layout shell
  if (pathname === '/admin/login') {
    return children
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <ResponsiveSidebar
        mode={sidebarMode}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        newEnquiries={newEnquiries}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex items-center px-4 gap-3 sticky top-0 z-30">
          {/* Mobile hamburger */}
          {breakpoint === 'mobile' && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white p-2 -ml-1 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Open navigation menu"
            >
              <FiMenu size={20} />
            </button>
          )}

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-800/60 border border-gray-700/50 text-gray-300 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-600 transition-all"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-1">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false) }}
                className={`relative text-gray-400 hover:text-white p-2 rounded-lg transition-colors ${notifOpen ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'}`}
                aria-label={`Notifications${newEnquiries > 0 ? ` (${newEnquiries} new)` : ''}`}
              >
                <FiBell size={18} />
                {newEnquiries > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-gray-900">
                    {newEnquiries > 9 ? '9+' : newEnquiries}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiBell size={14} className="text-blue-400" />
                      <h3 className="text-white font-semibold text-sm">Notifications</h3>
                    </div>
                    {newEnquiries > 0 && (
                      <span className="bg-red-500/20 text-red-400 text-xs font-medium px-2 py-0.5 rounded-full">
                        {newEnquiries} new
                      </span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {recentEnquiries.length > 0 ? (
                      <div className="divide-y divide-gray-800/50">
                        {recentEnquiries.slice(0, 6).map(enq => (
                          <Link
                            key={enq.id}
                            href="/admin/enquiries"
                            onClick={() => setNotifOpen(false)}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white font-bold text-[10px]">{enq.first_name?.[0]?.toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {enq.first_name} {enq.last_name}
                              </p>
                              <p className="text-gray-500 text-xs truncate mt-0.5">
                                {enq.subject || enq.email}
                              </p>
                              <p className="text-gray-600 text-[10px] mt-1">
                                {new Date(enq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize font-medium flex-shrink-0 ${
                              enq.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                              enq.status === 'replied' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-800 text-gray-500'
                            }`}>
                              {enq.status}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10">
                        <FiMessageSquare size={24} className="text-gray-700 mb-2" />
                        <p className="text-gray-500 text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50">
                    <Link
                      href="/admin/enquiries"
                      onClick={() => setNotifOpen(false)}
                      className="text-blue-400 text-xs font-medium hover:text-blue-300 transition-colors flex items-center justify-center gap-1"
                    >
                      View all enquiries →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
                className={`flex items-center gap-2 pl-2 ml-1 border-l border-gray-800 py-1 pr-1 rounded-r-lg transition-colors ${profileOpen ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xs">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-white text-sm font-medium leading-tight">{user?.name}</p>
                  <p className={`text-[10px] font-medium ${user?.role === 'superadmin' ? 'text-purple-400' : 'text-blue-400'}`}>
                    {user?.role}
                  </p>
                </div>
                <FiChevronDown size={14} className={`text-gray-500 hidden sm:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Panel */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-4 border-b border-gray-800 bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                        <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                          user?.role === 'superadmin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/admin/users"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/70 transition-colors"
                    >
                      <FiUser size={16} className="text-gray-500" />
                      <span className="text-sm">My Profile</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/70 transition-colors"
                    >
                      <FiSettings size={16} className="text-gray-500" />
                      <span className="text-sm">Site Settings</span>
                    </Link>
                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/70 transition-colors"
                    >
                      <FiExternalLink size={16} className="text-gray-500" />
                      <span className="text-sm">View Website</span>
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-800 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors w-full"
                    >
                      <FiLogOut size={16} />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
