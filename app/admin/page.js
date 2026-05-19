'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FiPackage, FiTag, FiFileText, FiHelpCircle, FiMessageSquare,
  FiUsers, FiTrendingUp, FiEye, FiArrowRight, FiPlus,
  FiSettings, FiStar, FiBarChart2, FiClock, FiActivity
} from 'react-icons/fi'

function StatCard({ icon: Icon, label, value, color, bgColor, href }) {
  return (
    <Link
      href={href}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 hover:border-gray-700 hover:shadow-lg hover:shadow-black/20 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
        <FiArrowRight size={14} className="text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
      </div>
      <div className="mt-3 sm:mt-4">
        <p className="text-2xl sm:text-3xl font-bold text-white">{value ?? '—'}</p>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{label}</p>
      </div>
    </Link>
  )
}

function QuickAction({ icon: Icon, label, href, color }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/70 transition-colors group"
    >
      <div className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center group-hover:scale-105 transition-transform`}>
        <Icon size={14} className={color} />
      </div>
      <span className="text-gray-400 group-hover:text-white text-sm transition-colors flex-1">{label}</span>
      <FiArrowRight size={12} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
    </Link>
  )
}

const statusColors = {
  new: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  read: 'bg-gray-800 text-gray-400 border border-gray-700',
  replied: 'bg-green-500/10 text-green-400 border border-green-500/20',
  closed: 'bg-gray-800/50 text-gray-600 border border-gray-700/50',
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FiClock size={12} />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5 animate-pulse">
              <div className="w-10 h-10 bg-gray-800 rounded-xl mb-3" />
              <div className="h-7 bg-gray-800 rounded mb-2 w-14" />
              <div className="h-4 bg-gray-800 rounded w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={FiPackage} label="Active Products" value={data?.stats?.products} color="text-blue-400" bgColor="bg-blue-500/10" href="/admin/products" />
          <StatCard icon={FiTag} label="Categories" value={data?.stats?.categories} color="text-purple-400" bgColor="bg-purple-500/10" href="/admin/categories" />
          <StatCard icon={FiFileText} label="Blog Posts" value={data?.stats?.blogs} color="text-green-400" bgColor="bg-green-500/10" href="/admin/blog" />
          <StatCard icon={FiHelpCircle} label="FAQs" value={data?.stats?.faqs} color="text-amber-400" bgColor="bg-amber-500/10" href="/admin/faqs" />
          <StatCard icon={FiMessageSquare} label="New Enquiries" value={data?.stats?.newEnquiries} color="text-red-400" bgColor="bg-red-500/10" href="/admin/enquiries?status=new" />
          <StatCard icon={FiTrendingUp} label="Total Enquiries" value={data?.stats?.totalEnquiries} color="text-orange-400" bgColor="bg-orange-500/10" href="/admin/enquiries" />
          <StatCard icon={FiUsers} label="Admin Users" value={data?.stats?.users} color="text-cyan-400" bgColor="bg-cyan-500/10" href="/admin/users" />
          <StatCard icon={FiEye} label="Content Sections" value="All Pages" color="text-indigo-400" bgColor="bg-indigo-500/10" href="/admin/content" />
        </div>
      )}

      {/* Quick Actions + Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity size={16} className="text-blue-400" />
            <h2 className="text-white font-semibold text-sm sm:text-base">Quick Actions</h2>
          </div>
          <div className="space-y-1">
            <QuickAction icon={FiPlus} label="Add New Product" href="/admin/products" color="text-blue-400" />
            <QuickAction icon={FiFileText} label="Write Blog Post" href="/admin/blog" color="text-green-400" />
            <QuickAction icon={FiHelpCircle} label="Add FAQ" href="/admin/faqs" color="text-amber-400" />
            <QuickAction icon={FiTag} label="Add Category" href="/admin/categories" color="text-purple-400" />
            <QuickAction icon={FiStar} label="Testimonials" href="/admin/testimonials" color="text-yellow-400" />
            <QuickAction icon={FiSettings} label="Site Settings" href="/admin/settings" color="text-gray-400" />
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiMessageSquare size={16} className="text-red-400" />
              <h2 className="text-white font-semibold text-sm sm:text-base">Recent Enquiries</h2>
            </div>
            <Link href="/admin/enquiries" className="text-blue-400 text-xs hover:text-blue-300 transition-colors flex items-center gap-1">
              View all <FiArrowRight size={10} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-800/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : data?.recentEnquiries?.length > 0 ? (
            <div className="space-y-2">
              {data.recentEnquiries.map(enq => (
                <Link
                  key={enq.id}
                  href={`/admin/enquiries`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">{enq.first_name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">
                      {enq.first_name} {enq.last_name}
                    </p>
                    <p className="text-gray-500 text-xs truncate">{enq.subject || enq.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${statusColors[enq.status]}`}>
                      {enq.status}
                    </span>
                    <span className="text-gray-600 text-[10px]">
                      {new Date(enq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mb-3">
                <FiMessageSquare size={24} className="text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">No enquiries yet</p>
              <p className="text-gray-600 text-xs mt-1">They'll appear here when customers reach out</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
