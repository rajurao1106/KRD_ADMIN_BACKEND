'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiTag, FiImage, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Modal, Field, inputCls, textareaCls, selectCls, PageHeader, AdminTable, StatusBadge, Toggle, ImageUploadField } from '@/components/admin/AdminComponents'

const defaultForm = { name: '', slug: '', description: '', parent_id: '', sort_order: 0, is_active: true }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [imageData, setImageData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const res = await window.fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data.categories || [])
    setLoading(false)
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function setField(key, val) {
    if (key === 'name' && !editItem) {
      const slug = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setForm(prev => ({ ...prev, name: val, slug }))
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
    setForm({ ...item, is_active: item.is_active === 1 || item.is_active === true })
    setImageData(null)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name) return showToast('Category name required', 'error')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
      })
      if (imageData?.file) fd.append('image', imageData.file)
      else if (imageData?.fileUrl) fd.set('image_url', imageData.fileUrl)

      const url = editItem ? `/api/admin/categories/${editItem.id}` : '/api/admin/categories'
      const res = await window.fetch(url, { method: editItem ? 'PUT' : 'POST', body: fd })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }

      showToast(editItem ? 'Category updated!' : 'Category created!')
      setModalOpen(false)
      fetchData()
    } catch (e) {
      showToast(e.message || 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Products in it will be uncategorized.')) return
    const res = await window.fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) return showToast(data.error || 'Delete failed', 'error')
    showToast('Category deleted')
    fetchData()
  }

  const columns = [
    {
      key: 'image_url', label: 'Image',
      render: row => row.image_url
        ? <img src={row.image_url} alt={row.name} className="w-10 h-10 object-cover rounded-lg border border-gray-700" />
        : <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center"><FiImage size={16} className="text-gray-600" /></div>
    },
    { key: 'name', label: 'Name', render: row => <span className="font-medium text-white">{row.name}</span> },
    { key: 'slug', label: 'Slug', render: row => <span className="font-mono text-xs text-gray-500">{row.slug}</span> },
    { key: 'parent_name', label: 'Parent', render: row => row.parent_name || <span className="text-gray-600">Root</span> },
    { key: 'product_count', label: 'Products', render: row => <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium">{row.product_count || 0}</span> },
    { key: 'is_active', label: 'Status', render: row => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
    { key: 'sort_order', label: 'Order' },
  ]

  const parentOptions = categories.filter(c => !editItem || c.id !== editItem.id)

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-green-900 text-green-200 border border-green-700'}`}>
          {toast.msg}
        </div>
      )}

      <PageHeader
        title="Product Categories"
        description={`${categories.length} categories`}
        action={
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20">
            <FiPlus size={16} /> Add Category
          </button>
        }
      />

      <AdminTable columns={columns} data={categories} loading={loading} onEdit={openEdit} onDelete={handleDelete} emptyMessage="No categories yet" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Category' : 'Add Category'} size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category Name" required>
              <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g., Floor Cleaners" className={inputCls} />
            </Field>
            <Field label="URL Slug">
              <input type="text" value={form.slug || ''} onChange={e => setField('slug', e.target.value)} placeholder="floor-cleaners" className={inputCls} />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={form.description || ''} onChange={e => setField('description', e.target.value)} rows={3} className={textareaCls} placeholder="Category description..." />
          </Field>

          <ImageUploadField value={form.image_url} onChange={setImageData} label="Category Image" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Parent Category">
              <select value={form.parent_id || ''} onChange={e => setField('parent_id', e.target.value)} className={selectCls}>
                <option value="">-- Root Category --</option>
                {parentOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Sort Order">
              <input type="number" value={form.sort_order || 0} onChange={e => setField('sort_order', e.target.value)} className={inputCls} />
            </Field>
          </div>

          <Toggle checked={!!form.is_active} onChange={v => setField('is_active', v)} label="Active" />

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editItem ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
