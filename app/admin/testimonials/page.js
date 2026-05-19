'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiStar } from 'react-icons/fi'
import { Modal, Field, inputCls, textareaCls, selectCls, PageHeader, AdminTable, StatusBadge, Toggle, ImageUploadField } from '@/components/admin/AdminComponents'

const defaultForm = { name: '', position: '', company: '', content: '', rating: 5, avatar_initial: '', avatar_bg_color: '#0056B3', source: 'Google', is_featured: false, sort_order: 0, is_active: true }

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [imageData, setImageData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    setLoading(true)
    const res = await fetch('/api/admin/testimonials')
    const data = await res.json()
    setItems(data.testimonials || [])
    setLoading(false)
  }

  function showToast(msg, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }
  function setField(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  function openCreate() { setEditItem(null); setForm(defaultForm); setImageData(null); setModalOpen(true) }
  function openEdit(item) {
    setEditItem(item)
    setForm({ ...item, is_active: item.is_active === 1 || item.is_active === true, is_featured: item.is_featured === 1 || item.is_featured === true })
    setImageData(null)
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.content) return showToast('Name and content required', 'error')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
      })
      if (imageData?.file) fd.append('avatar', imageData.file)

      const url = editItem ? `/api/admin/testimonials/${editItem.id}` : '/api/admin/testimonials'
      const res = await fetch(url, { method: editItem ? 'PUT' : 'POST', body: fd })
      if (!res.ok) throw new Error()

      showToast(editItem ? 'Updated!' : 'Created!')
      setModalOpen(false)
      fetchItems()
    } catch { showToast('Failed to save', 'error') }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete?')) return
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    showToast('Deleted')
    fetchItems()
  }

  const columns = [
    {
      key: 'name', label: 'Person',
      render: row => (
        <div className="flex items-center gap-3">
          {row.avatar_url
            ? <img src={row.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            : <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: row.avatar_bg_color }}>{row.avatar_initial || row.name[0]}</div>
          }
          <div>
            <p className="text-white font-medium">{row.name}</p>
            {row.company && <p className="text-gray-500 text-xs">{row.company}</p>}
          </div>
        </div>
      )
    },
    { key: 'content', label: 'Review', render: row => <span className="text-gray-400 text-xs line-clamp-2 italic">"{row.content}"</span> },
    { key: 'rating', label: 'Rating', render: row => (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => <FiStar key={i} size={12} className={i < row.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'} />)}
      </div>
    )},
    { key: 'source', label: 'Source' },
    { key: 'is_active', label: 'Status', render: row => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
  ]

  return (
    <div className="space-y-6">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-green-900 text-green-200 border border-green-700'}`}>{toast.msg}</div>}

      <PageHeader title="Testimonials" description={`${items.length} testimonials`}
        action={<button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"><FiPlus size={16} /> Add Testimonial</button>} />

      <AdminTable columns={columns} data={items} loading={loading} onEdit={openEdit} onDelete={handleDelete} emptyMessage="No testimonials" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Testimonial' : 'Add Testimonial'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Person Name" required>
              <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} className={inputCls} placeholder="Name" />
            </Field>
            <Field label="Rating">
              <select value={form.rating} onChange={e => setField('rating', parseInt(e.target.value))} className={selectCls}>
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Position / Title">
              <input type="text" value={form.position || ''} onChange={e => setField('position', e.target.value)} className={inputCls} placeholder="CEO, Manager..." />
            </Field>
            <Field label="Company">
              <input type="text" value={form.company || ''} onChange={e => setField('company', e.target.value)} className={inputCls} placeholder="Company name" />
            </Field>
          </div>

          <Field label="Review Content" required>
            <textarea value={form.content} onChange={e => setField('content', e.target.value)} rows={4} className={textareaCls} placeholder="Testimonial text..." />
          </Field>

          <ImageUploadField value={form.avatar_url} onChange={setImageData} label="Avatar Photo (optional)" />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Avatar Initial (if no photo)">
              <input type="text" maxLength={2} value={form.avatar_initial || ''} onChange={e => setField('avatar_initial', e.target.value)} className={inputCls} placeholder="A" />
            </Field>
            <Field label="Avatar Background Color">
              <div className="flex gap-2">
                <input type="color" value={form.avatar_bg_color || '#0056B3'} onChange={e => setField('avatar_bg_color', e.target.value)} className="w-9 h-9 rounded border border-gray-700 cursor-pointer" />
                <input type="text" value={form.avatar_bg_color || '#0056B3'} onChange={e => setField('avatar_bg_color', e.target.value)} className={inputCls} />
              </div>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Source">
              <select value={form.source || 'Google'} onChange={e => setField('source', e.target.value)} className={selectCls}>
                <option>Google</option><option>Facebook</option><option>Website</option><option>IndiaMART</option><option>Other</option>
              </select>
            </Field>
            <Field label="Sort Order">
              <input type="number" value={form.sort_order || 0} onChange={e => setField('sort_order', e.target.value)} className={inputCls} />
            </Field>
          </div>

          <div className="flex gap-6">
            <Toggle checked={!!form.is_active} onChange={v => setField('is_active', v)} label="Active" />
            <Toggle checked={!!form.is_featured} onChange={v => setField('is_featured', v)} label="Featured" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editItem ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
