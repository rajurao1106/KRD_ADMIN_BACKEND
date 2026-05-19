'use client'

import { useState, useEffect } from 'react'
import { FiMessageSquare, FiSearch, FiMail, FiPhone } from 'react-icons/fi'
import { Modal, PageHeader, StatusBadge, selectCls, textareaCls } from '@/components/admin/AdminComponents'

const statusColors = {
  new: 'bg-blue-600',
  read: 'bg-gray-600',
  replied: 'bg-green-600',
  closed: 'bg-gray-800',
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchEnquiries() }, [page, filterStatus, filterType])

  async function fetchEnquiries() {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 15 })
    if (filterStatus !== 'all') params.set('status', filterStatus)
    if (filterType !== 'all') params.set('type', filterType)
    const res = await fetch(`/api/admin/enquiries?${params}`)
    const data = await res.json()
    setEnquiries(data.enquiries || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function openEnquiry(id) {
    const res = await fetch(`/api/admin/enquiries/${id}`)
    const data = await res.json()
    setSelected(data.enquiry)
    setNotes(data.enquiry?.notes || '')
    fetchEnquiries() // refresh to update status count
  }

  async function updateStatus(status) {
    if (!selected) return
    setUpdating(true)
    await fetch(`/api/admin/enquiries/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    })
    setSelected(prev => ({ ...prev, status, notes }))
    showToast('Status updated')
    fetchEnquiries()
    setUpdating(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this enquiry?')) return
    await fetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' })
    if (selected?.id === id) setSelected(null)
    showToast('Enquiry deleted')
    fetchEnquiries()
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-green-900 text-green-200 border border-green-700'}`}>
          {toast.msg}
        </div>
      )}

      <PageHeader title="Enquiries" description={`${total} total enquiries`} />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1">
          {['all', 'new', 'read', 'replied', 'closed'].map(s => (
            <button key={s} onClick={() => { setFilterStatus(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {['all', 'contact', 'quote', 'faq'].map(t => (
            <button key={t} onClick={() => { setFilterType(t); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterType === t ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enquiry List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-white font-semibold text-sm">Inbox</p>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-lg animate-pulse" />)}
            </div>
          ) : enquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FiMessageSquare size={32} className="text-gray-700 mb-3" />
              <p className="text-gray-500 text-sm">No enquiries</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
              {enquiries.map(enq => (
                <button key={enq.id} onClick={() => openEnquiry(enq.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition-colors ${selected?.id === enq.id ? 'bg-gray-800' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${statusColors[enq.status] || 'bg-gray-600'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${enq.status === 'new' ? 'text-white' : 'text-gray-400'}`}>
                          {enq.first_name} {enq.last_name}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize font-medium ${enq.type === 'quote' ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-800 text-gray-500'}`}>
                            {enq.type}
                          </span>
                          <span className="text-gray-600 text-xs">{new Date(enq.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs truncate mt-0.5">{enq.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {Math.ceil(total / 15) > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="text-xs text-gray-400 hover:text-white disabled:opacity-30">← Prev</button>
              <span className="text-gray-600 text-xs">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={enquiries.length < 15}
                className="text-xs text-gray-400 hover:text-white disabled:opacity-30">Next →</button>
            </div>
          )}
        </div>

        {/* Enquiry Detail */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <FiMessageSquare size={40} className="text-gray-700 mb-4" />
              <p className="text-gray-500">Select an enquiry to view details</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{selected.first_name} {selected.last_name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{selected.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <button onClick={() => handleDelete(selected.id)} className="text-xs px-2 py-1 bg-red-900/30 hover:bg-red-900 text-red-400 rounded transition-colors">Delete</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Contact details */}
                <div className="grid grid-cols-2 gap-3">
                  {selected.phone && (
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-3">
                      <FiPhone size={14} className="text-blue-400" />
                      <span className="text-gray-300 text-sm">{selected.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-3">
                    <FiMail size={14} className="text-blue-400" />
                    <span className="text-gray-300 text-xs truncate">{selected.email}</span>
                  </div>
                </div>

                {selected.subject && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Subject</p>
                    <p className="text-white text-sm">{selected.subject}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Message</p>
                  <div className="bg-gray-800 rounded-lg p-4 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>

                {selected.product_interest && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Product Interest</p>
                    <p className="text-blue-400 text-sm">{selected.product_interest}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Admin Notes</p>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-600"
                    placeholder="Add internal notes..." />
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <span>Type: <span className="text-gray-400 capitalize">{selected.type}</span></span>
                  <span>IP: <span className="text-gray-400">{selected.ip_address}</span></span>
                  <span>Received: <span className="text-gray-400">{new Date(selected.created_at).toLocaleString()}</span></span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-4 border-t border-gray-800">
                <div className="flex gap-2">
                  {['new', 'read', 'replied', 'closed'].map(s => (
                    <button key={s} onClick={() => updateStatus(s)} disabled={updating || selected.status === s}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${selected.status === s ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-400'} disabled:opacity-50`}>
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={() => window.open(`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your Enquiry'}&body=Dear ${selected.first_name},`)}
                  className="w-full mt-2 py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                  <FiMail size={12} /> Reply via Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
