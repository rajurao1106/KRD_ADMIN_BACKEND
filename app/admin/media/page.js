'use client'

import { useState, useEffect, useRef } from 'react'
import { FiUpload, FiImage, FiTrash2, FiCopy, FiCheck, FiSearch } from 'react-icons/fi'
import { PageHeader } from '@/components/admin/AdminComponents'

export default function AdminMediaPage() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState([])
  const [toast, setToast] = useState(null)
  const inputRef = useRef()

  useEffect(() => { fetchMedia() }, [page])

  async function fetchMedia() {
    setLoading(true)
    const res = await fetch(`/api/admin/media?page=${page}&limit=24`)
    const data = await res.json()
    setMedia(data.media || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      fd.append('folder', 'general')
      const res = await fetch('/api/admin/media', { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      showToast(`${files.length} file(s) uploaded!`)
      fetchMedia()
    } catch {
      showToast('Upload failed', 'error')
    } finally {
      setUploading(false)
      inputRef.current.value = ''
    }
  }

  async function handleDelete(id, fileUrl) {
    if (!confirm('Delete this image? This cannot be undone.')) return
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
    showToast('Image deleted')
    fetchMedia()
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.length} selected images?`)) return
    await Promise.all(selected.map(id => fetch(`/api/admin/media/${id}`, { method: 'DELETE' })))
    setSelected([])
    showToast(`${selected.length} images deleted`)
    fetchMedia()
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const filtered = media.filter(m => !search || m.original_name.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(total / 24)

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-green-900 text-green-200 border border-green-700'}`}>
          {toast.msg}
        </div>
      )}

      <PageHeader
        title="Media Library"
        description={`${total} files total`}
        action={
          <div className="flex gap-3">
            {selected.length > 0 && (
              <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-900/50 hover:bg-red-900 text-red-400 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                <FiTrash2 size={16} /> Delete {selected.length}
              </button>
            )}
            <button onClick={() => inputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
              ) : (
                <><FiUpload size={16} /> Upload Images</>
              )}
            </button>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          </div>
        }
      />

      {/* Drag & Drop zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files); if (files.length) { const dt = new DataTransfer(); files.forEach(f => dt.items.add(f)); inputRef.current.files = dt.files; handleUpload({ target: { files: dt.files } }) } }}
        className="border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-xl p-8 text-center transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <FiUpload size={32} className="text-gray-600 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Drag & drop images here, or click to browse</p>
        <p className="text-gray-700 text-xs mt-1">JPG, PNG, WebP, GIF, SVG supported</p>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by filename..."
          className="w-full bg-gray-800 border border-gray-700 text-white pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {[...Array(16)].map((_, i) => <div key={i} className="aspect-square bg-gray-800 rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FiImage size={48} className="text-gray-700 mb-4" />
          <p className="text-gray-500">No images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filtered.map(item => (
            <div key={item.id} className={`relative group aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selected.includes(item.id) ? 'border-blue-500' : 'border-transparent hover:border-gray-600'}`}>
              <img src={item.file_url} alt={item.alt_text || item.original_name}
                className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />

              {/* Checkbox */}
              <div className={`absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selected.includes(item.id) ? 'bg-blue-500 border-blue-500' : 'border-white/50 bg-black/30 opacity-0 group-hover:opacity-100'}`}
                onClick={() => toggleSelect(item.id)}>
                {selected.includes(item.id) && <FiCheck size={12} className="text-white" />}
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <button onClick={() => copyUrl(item.file_url)}
                  className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium py-1 rounded transition-colors">
                  {copied === item.file_url ? <><FiCheck size={10} /> Copied!</> : <><FiCopy size={10} /> Copy URL</>}
                </button>
                <button onClick={() => handleDelete(item.id, item.file_url)}
                  className="w-full flex items-center justify-center gap-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-medium py-1 rounded transition-colors">
                  <FiTrash2 size={10} /> Delete
                </button>
              </div>

              {/* File info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-[9px] truncate">{item.original_name}</p>
                <p className="text-gray-400 text-[8px]">{(item.file_size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-700">← Prev</button>
          <span className="text-gray-500 text-sm">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-700">Next →</button>
        </div>
      )}
    </div>
  )
}
