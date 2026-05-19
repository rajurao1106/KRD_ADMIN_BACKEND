'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiHelpCircle } from 'react-icons/fi'
import { Modal, Field, inputCls, textareaCls, selectCls, PageHeader, AdminTable, StatusBadge, Toggle } from '@/components/admin/AdminComponents'

const defaultForm = { question: '', answer: '', category: 'General', page: 'both', sort_order: 0, is_active: true }

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchFaqs() }, [])

  async function fetchFaqs() {
    setLoading(true)
    const res = await fetch('/api/admin/faqs?active=false')
    const data = await res.json()
    setFaqs(data.faqs || [])
    setLoading(false)
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function setField(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  function openCreate() { setEditItem(null); setForm(defaultForm); setModalOpen(true) }
  function openEdit(item) {
    setEditItem(item)
    setForm({ ...item, is_active: item.is_active === 1 || item.is_active === true })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.question || !form.answer) return showToast('Question and answer required', 'error')
    setSaving(true)
    try {
      const url = editItem ? `/api/admin/faqs/${editItem.id}` : '/api/admin/faqs'
      const res = await fetch(url, {
        method: editItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, is_active: form.is_active ? 1 : 0 })
      })
      if (!res.ok) throw new Error()
      showToast(editItem ? 'FAQ updated!' : 'FAQ created!')
      setModalOpen(false)
      fetchFaqs()
    } catch {
      showToast('Failed to save FAQ', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this FAQ?')) return
    await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' })
    showToast('FAQ deleted')
    fetchFaqs()
  }

  const columns = [
    { key: 'sort_order', label: '#', render: row => <span className="text-gray-500">{row.sort_order}</span> },
    { key: 'question', label: 'Question', render: row => <span className="font-medium text-white">{row.question}</span> },
    { key: 'answer', label: 'Answer', render: row => <span className="text-gray-400 text-xs line-clamp-2">{row.answer}</span> },
    { key: 'category', label: 'Category' },
    { key: 'page', label: 'Shown On', render: row => <span className="capitalize text-xs text-blue-400">{row.page}</span> },
    { key: 'is_active', label: 'Status', render: row => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
  ]

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-green-900 text-green-200 border border-green-700'}`}>
          {toast.msg}
        </div>
      )}

      <PageHeader
        title="FAQs"
        description={`${faqs.length} questions`}
        action={
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <FiPlus size={16} /> Add FAQ
          </button>
        }
      />

      <AdminTable columns={columns} data={faqs} loading={loading} onEdit={openEdit} onDelete={handleDelete} emptyMessage="No FAQs yet" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit FAQ' : 'Add FAQ'} size="lg">
        <div className="space-y-5">
          <Field label="Question" required>
            <textarea value={form.question} onChange={e => setField('question', e.target.value)} rows={2} className={textareaCls} placeholder="Enter the question..." />
          </Field>

          <Field label="Answer" required>
            <textarea value={form.answer} onChange={e => setField('answer', e.target.value)} rows={6} className={textareaCls} placeholder="Enter the answer..." />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <input type="text" value={form.category || ''} onChange={e => setField('category', e.target.value)} placeholder="General, Products, Pricing..." className={inputCls} />
            </Field>
            <Field label="Show On Page">
              <select value={form.page || 'both'} onChange={e => setField('page', e.target.value)} className={selectCls}>
                <option value="both">Both (Home + FAQ)</option>
                <option value="home">Home Page Only</option>
                <option value="faq">FAQ Page Only</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Sort Order">
              <input type="number" value={form.sort_order || 0} onChange={e => setField('sort_order', e.target.value)} className={inputCls} />
            </Field>
            <div className="flex items-end pb-2.5">
              <Toggle checked={!!form.is_active} onChange={v => setField('is_active', v)} label="Active" />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editItem ? 'Update FAQ' : 'Create FAQ'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
