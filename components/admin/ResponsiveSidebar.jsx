'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MdDashboard, MdLayers, MdSettings, MdClose
} from 'react-icons/md'
import {
  FiPackage, FiTag, FiFileText, FiHelpCircle, FiMessageSquare,
  FiUsers, FiImage, FiBarChart2, FiStar, FiLogOut, FiExternalLink
} from 'react-icons/fi'

const navSections = [
  { label: 'Overview', items: [
    { href: '/admin', label: 'Dashboard', icon: MdDashboard },
  ]},
  { label: 'Content', items: [
    { href: '/admin/content', label: 'Page Sections', icon: MdLayers },
    { href: '/admin/blog', label: 'Blog Posts', icon: FiFileText },
    { href: '/admin/faqs', label: 'FAQs', icon: FiHelpCircle },
    { href: '/admin/testimonials', label: 'Testimonials', icon: FiStar },
    { href: '/admin/stats', label: 'Stats & Impact', icon: FiBarChart2 },
  ]},
  { label: 'Products', items: [
    { href: '/admin/products', label: 'Products', icon: FiPackage },
    { href: '/admin/categories', label: 'Categories', icon: FiTag },
  ]},
  { label: 'Communication', items: [
    { href: '/admin/enquiries', label: 'Enquiries', icon: FiMessageSquare },
    { href: '/admin/media', label: 'Media Library', icon: FiImage },
  ]},
  { label: 'System', items: [
    { href: '/admin/users', label: 'Users', icon: FiUsers },
    { href: '/admin/settings', label: 'Site Settings', icon: MdSettings },
  ]},
]

export default function ResponsiveSidebar({ mode, isOpen, onClose, user, newEnquiries, onLogout }) {
  const pathname = usePathname()

  // Hidden on mobile when closed
  if (mode === 'hidden' && !isOpen) return null

  const isCollapsed = mode === 'collapsed'
  const isDrawer = mode === 'hidden' && isOpen

  return (
    <>
      {/* Mobile backdrop */}
      {isDrawer && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          ${isDrawer ? 'fixed inset-y-0 left-0 z-50 w-72' : ''}
          ${isCollapsed ? 'w-[68px]' : ''}
          ${mode === 'expanded' ? 'w-64' : ''}
          ${!isDrawer ? 'relative' : ''}
          bg-gray-900 border-r border-gray-800 flex flex-col h-full
          transition-all duration-300 ease-in-out
        `}
        role="navigation"
        aria-label="Admin navigation"
      >
        {/* Logo Header */}
        <div className={`p-4 border-b border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
            <span className="text-white font-black text-xs">KRD</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">KRD Admin</p>
              <p className="text-gray-500 text-[11px]">Clean & Care</p>
            </div>
          )}
          {isDrawer && (
            <button
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              aria-label="Close sidebar"
            >
              <MdClose size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-5 scrollbar-thin">
          {navSections.map(section => (
            <div key={section.label}>
              {!isCollapsed && (
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest px-3 mb-2">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={isDrawer ? onClose : undefined}
                      title={isCollapsed ? item.label : undefined}
                      className={`
                        flex items-center gap-3 rounded-lg text-sm font-medium transition-all relative group
                        ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                        ${active
                          ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                          : 'text-gray-400 hover:bg-gray-800/70 hover:text-white border border-transparent'
                        }
                      `}
                    >
                      <Icon size={18} className={active ? 'text-blue-400' : ''} />
                      {!isCollapsed && <span>{item.label}</span>}
                      {item.label === 'Enquiries' && newEnquiries > 0 && (
                        <span className={`
                          bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center
                          ${isCollapsed ? 'absolute -top-0.5 -right-0.5' : 'ml-auto'}
                        `}>
                          {newEnquiries > 9 ? '9+' : newEnquiries}
                        </span>
                      )}

                      {/* Tooltip for collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-lg">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className={`border-t border-gray-800 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <FiExternalLink size={12} /> View Site
                </Link>
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-2 py-2 rounded-lg hover:bg-red-950/50 transition-colors"
                >
                  <FiLogOut size={12} /> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center" title={user?.name}>
                <span className="text-white font-bold text-[10px]">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-950/50 transition-colors"
              >
                <FiLogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
