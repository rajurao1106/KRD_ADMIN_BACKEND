'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiBarChart2 } from 'react-icons/fi'
import { Modal, Field, inputCls, PageHeader, AdminTable, StatusBadge, Toggle } from '@/components/admin/AdminComponents'

const defaultForm = { label: '', value: '', icon: '', bg_color: '#e1f3d0', icon_color: '#16a34a', sort_order: 0, is_active: true }

export default function AdminStatsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchItems() }, [])

  async function fetchItems() {
    setLoading(true)
    const res = await fetch('/api/admin/stats')
    const data = await res.json()
    setItems(data.stats || [])
    setLoading(false)
  }

  function showToast(msg, type = 'success') { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }
  function setField(k, v) { setForm(p => ({ ...p, [k]: v })) }
  function openCreate() { setEditItem(null); setForm(defaultForm); setModalOpen(true) }
  function openEdit(item) { setEditItem(item); setForm({ ...item, is_active: item.is_active === 1 || item.is_active === true }); setModalOpen(true) }

  async function handleSave() {
    if (!form.label || !form.value) return showToast('Label and value required', 'error')
    setSaving(true)
    try {
      const url = editItem ? `/api/admin/stats/${editItem.id}` : '/api/admin/stats'
      const res = await fetch(url, { method: editItem ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, is_active: form.is_active ? 1 : 0 }) })
      if (!res.ok) throw new Error()
      showToast(editItem ? 'Updated!' : 'Created!')
      setModalOpen(false)
      fetchItems()
    } catch { showToast('Failed to save', 'error') }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this stat?')) return
    await fetch(`/api/admin/stats/${id}`, { method: 'DELETE' })
    showToast('Deleted')
    fetchItems()
  }

  const columns = [
    { key: 'value', label: 'Value', render: row => <span className="text-2xl font-black" style={{ color: row.icon_color || '#0056B3' }}>{row.value}</span> },
    { key: 'label', label: 'Label', render: row => <span className="font-medium text-white">{row.label}</span> },
    { key: 'bg_color', label: 'Colors', render: row => (
      <div className="flex gap-2 items-center">
        <div className="w-6 h-6 rounded" style={{ background: row.bg_color }} />
        <div className="w-6 h-6 rounded" style={{ background: row.icon_color }} />
      </div>
    )},
    { key: 'sort_order', label: 'Order' },
    { key: 'is_active', label: 'Status', render: row => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
  ]

  return (
    <div className="space-y-6">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-green-900 text-green-200 border border-green-700'}`}>{toast.msg}</div>}

      <PageHeader title="Stats & Impact Numbers" description="Numbers shown in the impact section"
        action={<button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"><FiPlus size={16} /> Add Stat</button>} />

      {/* Preview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
        {items.slice(0, 4).map((s, i) => (
          <div key={i} className="rounded-xl p-4 text-center" style={{ background: s.bg_color || '#e1f3d0' }}>
            <p className="text-2xl font-black" style={{ color: s.icon_color || '#0056B3' }}>{s.value}</p>
            <p className="text-gray-600 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <AdminTable columns={columns} data={items} loading={loading} onEdit={openEdit} onDelete={handleDelete} emptyMessage="No stats yet" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Stat' : 'Add Stat'} size="md">
        <div className="space-y-4">
          <Field label="Value (shown large)" required>
            <input type="text" value={form.value} onChange={e => setField('value', e.target.value)} className={inputCls} placeholder="342,751+" />
          </Field>
          <Field label="Label" required>
            <input type="text" value={form.label} onChange={e => setField('label', e.target.value)} className={inputCls} placeholder="Clean litres sold" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Background Color">
              <div className="flex gap-2">
                <input type="color" value={form.bg_color} onChange={e => setField('bg_color', e.target.value)} className="w-9 h-9 rounded border border-gray-700 cursor-pointer" />
                <input type="text" value={form.bg_color} onChange={e => setField('bg_color', e.target.value)} className={inputCls} />
              </div>
            </Field>
            <Field label="Number Color">
              <div className="flex gap-2">
                <input type="color" value={form.icon_color} onChange={e => setField('icon_color', e.target.value)} className="w-9 h-9 rounded border border-gray-700 cursor-pointer" />
                <input type="text" value={form.icon_color} onChange={e => setField('icon_color', e.target.value)} className={inputCls} />
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sort Order">
              <input type="number" value={form.sort_order || 0} onChange={e => setField('sort_order', e.target.value)} className={inputCls} />
            </Field>
            <div className="flex items-end pb-2">
              <Toggle checked={!!form.is_active} onChange={v => setField('is_active', v)} label="Active" />
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editItem ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
