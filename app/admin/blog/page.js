'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiFileText, FiSearch } from 'react-icons/fi'
import { Modal, Field, inputCls, textareaCls, selectCls, PageHeader, AdminTable, StatusBadge, Toggle, ImageUploadField } from '@/components/admin/AdminComponents'

const defaultForm = {
  title: '', slug: '', category_id: '', excerpt: '', content: '',
  status: 'draft', is_featured: false, meta_title: '', meta_description: ''
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [imageData, setImageData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchPosts() }, [page, filterStatus])
  useEffect(() => { fetchCategories() }, [])

  async function fetchPosts() {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 10 })
    if (filterStatus !== 'all') params.set('status', filterStatus)
    else params.set('status', 'all')
    const res = await fetch(`/api/admin/blog?${params}`)
    const data = await res.json()
    setPosts(data.posts || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  async function fetchCategories() {
    const res = await fetch('/api/admin/blog-categories')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function setField(key, val) {
    if (key === 'title' && !editItem) {
      const slug = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setForm(prev => ({ ...prev, title: val, slug }))
    } else {
      setForm(prev => ({ ...prev, [key]: val }))
    }
  }

  function openCreate() {
    setEditItem(null)
    setForm(defaultForm)
    setImageData(null)
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setForm({ ...item, is_featured: item.is_featured === 1 || item.is_featured === true })
    setImageData(null)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.title) return showToast('Title is required', 'error')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
      })
      if (imageData?.file) fd.append('featured_image', imageData.file)
      else if (imageData?.fileUrl) fd.set('featured_image_url', imageData.fileUrl)

      const url = editItem ? `/api/admin/blog/${editItem.id}` : '/api/admin/blog'
      const res = await fetch(url, { method: editItem ? 'PUT' : 'POST', body: fd })
      if (!res.ok) throw new Error()

      showToast(editItem ? 'Post updated!' : 'Post created!')
      setModalOpen(false)
      fetchPosts()
    } catch {
      showToast('Failed to save post', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    showToast('Post deleted')
    fetchPosts()
  }

  const columns = [
    {
      key: 'featured_image', label: 'Image',
      render: row => row.featured_image
        ? <img src={row.featured_image} alt="" className="w-12 h-10 object-cover rounded border border-gray-700" />
        : <div className="w-12 h-10 bg-gray-800 rounded flex items-center justify-center"><FiFileText size={14} className="text-gray-600" /></div>
    },
    { key: 'title', label: 'Title', render: row => <span className="font-medium text-white">{row.title}</span> },
    { key: 'category_name', label: 'Category', render: row => row.category_name || <span className="text-gray-600">—</span> },
    { key: 'author_name', label: 'Author', render: row => row.author_name || <span className="text-gray-600">—</span> },
    { key: 'status', label: 'Status', render: row => <StatusBadge status={row.status} /> },
    { key: 'views', label: 'Views', render: row => <span className="text-gray-500">{row.views || 0}</span> },
    {
      key: 'published_at', label: 'Published',
      render: row => row.published_at ? new Date(row.published_at).toLocaleDateString() : <span className="text-gray-600">—</span>
    },
  ]

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-green-900 text-green-200 border border-green-700'}`}>
          {toast.msg}
        </div>
      )}

      <PageHeader
        title="Blog Posts"
        description={`${total} posts total`}
        action={
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20">
            <FiPlus size={16} /> New Post
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'published', 'draft', 'archived'].map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>

      <AdminTable columns={columns} data={posts} loading={loading} onEdit={openEdit} onDelete={handleDelete} emptyMessage="No blog posts found" />

      {/* Pagination */}
      {Math.ceil(total / 10) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm disabled:opacity-50">← Prev</button>
          <span className="text-gray-500 text-sm">Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={posts.length < 10}
            className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm disabled:opacity-50">Next →</button>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Post' : 'New Blog Post'} size="xl">
        <div className="space-y-5">
          <Field label="Post Title" required>
            <input type="text" value={form.title} onChange={e => setField('title', e.target.value)} placeholder="Blog post title" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="URL Slug">
              <input type="text" value={form.slug || ''} onChange={e => setField('slug', e.target.value)} className={inputCls} placeholder="post-url-slug" />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => setField('status', e.target.value)} className={selectCls}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </div>

          <Field label="Excerpt">
            <textarea value={form.excerpt || ''} onChange={e => setField('excerpt', e.target.value)} rows={2} className={textareaCls} placeholder="Short excerpt for listing pages..." />
          </Field>

          <Field label="Full Content">
            <textarea value={form.content || ''} onChange={e => setField('content', e.target.value)} rows={8} className={textareaCls} placeholder="Write your blog post content here..." />
          </Field>

          <ImageUploadField value={form.featured_image} onChange={setImageData} label="Featured Image" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Meta Title">
              <input type="text" value={form.meta_title || ''} onChange={e => setField('meta_title', e.target.value)} className={inputCls} placeholder="SEO title" />
            </Field>
            <Field label="Meta Description">
              <input type="text" value={form.meta_description || ''} onChange={e => setField('meta_description', e.target.value)} className={inputCls} placeholder="SEO description" />
            </Field>
          </div>

          <Toggle checked={!!form.is_featured} onChange={v => setField('is_featured', v)} label="Featured Post" />

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editItem ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
