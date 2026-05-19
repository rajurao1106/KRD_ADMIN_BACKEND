'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiChevronDown, FiChevronRight, FiLayers, FiEye, FiEyeOff } from 'react-icons/fi'
import { MdDragIndicator } from 'react-icons/md'
import { Modal, Field, inputCls, textareaCls, selectCls, PageHeader, StatusBadge, Toggle, ImageUploadField, TextStyleField } from '@/components/admin/AdminComponents'

const PAGES = [
  { value: 'home', label: 'Home Page' },
  { value: 'about', label: 'Our Story' },
  { value: 'products', label: 'Products' },
  { value: 'blog', label: 'Blog' },
  { value: 'faq', label: 'FAQ' },
  { value: 'contact', label: 'Contact Us' },
  { value: 'footer', label: 'Footer' },
]

const SECTIONS = {
  home: ['hero', 'about', 'categories', 'products', 'stats', 'testimonials', 'how_it_works', 'faq', 'banner', 'custom'],
  about: ['hero', 'story', 'certificates', 'clients', 'services', 'custom'],
  products: ['hero', 'intro', 'custom'],
  blog: ['hero', 'intro', 'custom'],
  faq: ['hero', 'intro', 'custom'],
  contact: ['hero', 'info', 'map', 'custom'],
  footer: ['about', 'links', 'contact', 'social', 'copyright', 'custom'],
}

const IMAGE_POSITIONS = ['left', 'right', 'top', 'bottom', 'background', 'center']
const CONTENT_ALIGNS = ['left', 'center', 'right']

const defaultForm = {
  page: 'home', section: 'hero', title: '', subtitle: '', mini_title: '', paragraph: '',
  image_url: '', external_url: '', button_text: '', button_url: '',
  title_color: '#111827', title_font: 'Lato', title_size: '4xl', title_weight: 'bold',
  subtitle_color: '#374151', subtitle_font: 'Poppins', paragraph_color: '#6B7280',
  image_position: 'right', content_align: 'left', bg_color: '#FFFFFF', sort_order: 0, is_active: true
}

export default function ContentSectionsPage() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [imageData, setImageData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filterPage, setFilterPage] = useState('all')
  const [expandedPages, setExpandedPages] = useState({ home: true })
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchSections() }, [])

  async function fetchSections() {
    setLoading(true)
    const res = await fetch('/api/admin/content?active=false')
    const data = await res.json()
    setSections(data.sections || [])
    setLoading(false)
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
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

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, String(v))
      })
      if (imageData?.file) fd.append('image', imageData.file)
      else if (imageData?.fileUrl) fd.set('image_url', imageData.fileUrl)

      const url = editItem ? `/api/admin/content/${editItem.id}` : '/api/admin/content'
      const method = editItem ? 'PUT' : 'POST'
      const res = await fetch(url, { method, body: fd })

      if (!res.ok) throw new Error('Save failed')

      showToast(editItem ? 'Section updated!' : 'Section created!')
      setModalOpen(false)
      fetchSections()
    } catch {
      showToast('Failed to save section', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this section?')) return
    await fetch(`/api/admin/content/${id}`, { method: 'DELETE' })
    showToast('Section deleted')
    fetchSections()
  }

  async function toggleActive(item) {
    await fetch(`/api/admin/content/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: item.is_active ? 0 : 1 })
    })
    fetchSections()
  }

  // Group sections by page
  const grouped = {}
  sections.forEach(s => {
    if (!grouped[s.page]) grouped[s.page] = {}
    if (!grouped[s.page][s.section]) grouped[s.page][s.section] = []
    grouped[s.page][s.section].push(s)
  })

  const filtered = filterPage === 'all' ? grouped : { [filterPage]: grouped[filterPage] || {} }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-green-900 text-green-200 border border-green-700'}`}>
          {toast.msg}
        </div>
      )}

      <PageHeader
        title="Page Content Sections"
        description="Manage all page sections, slides, banners and content blocks"
        action={
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <FiPlus size={16} /> Add Section
          </button>
        }
      />

      {/* Filter by page */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterPage('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterPage === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          All Pages
        </button>
        {PAGES.map(p => (
          <button key={p.value} onClick={() => setFilterPage(p.value)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterPage === p.value ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Sections grouped */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(filtered).map(([page, pageSections]) => {
            const pageInfo = PAGES.find(p => p.value === page)
            const isExpanded = expandedPages[page]
            const totalSections = Object.values(pageSections).flat().length

            return (
              <div key={page} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {/* Page header */}
                <button
                  onClick={() => setExpandedPages(prev => ({ ...prev, [page]: !prev[page] }))}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FiLayers size={18} className="text-blue-400" />
                    <div className="text-left">
                      <p className="text-white font-semibold">{pageInfo?.label || page}</p>
                      <p className="text-gray-500 text-xs">{totalSections} section{totalSections !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {isExpanded ? <FiChevronDown size={16} className="text-gray-400" /> : <FiChevronRight size={16} className="text-gray-400" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-800 divide-y divide-gray-800">
                    {Object.entries(pageSections).map(([sectionKey, items]) => (
                      <div key={sectionKey} className="px-5 py-4">
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">{sectionKey.replace(/_/g, ' ')}</p>
                        <div className="space-y-2">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg p-3 transition-colors group">
                              <MdDragIndicator size={14} className="text-gray-600" />
                              {item.image_url && (
                                <img src={item.image_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{item.title || item.mini_title || `Section #${item.id}`}</p>
                                {item.paragraph && <p className="text-gray-500 text-xs truncate mt-0.5">{item.paragraph}</p>}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => toggleActive(item)} className={`p-1.5 rounded transition-colors ${item.is_active ? 'text-green-400 hover:text-green-300' : 'text-gray-600 hover:text-gray-400'}`}>
                                  {item.is_active ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                                </button>
                                <button onClick={() => openEdit(item)} className="text-xs px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors">Edit</button>
                                <button onClick={() => handleDelete(item.id)} className="text-xs px-2.5 py-1 bg-red-900/40 hover:bg-red-900 text-red-400 rounded-md transition-colors">Delete</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Add section to this page */}
                    <div className="px-5 py-3">
                      <button onClick={() => { openCreate(); setField('page', page) }} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-400 transition-colors">
                        <FiPlus size={14} /> Add section to {pageInfo?.label || page}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {Object.keys(filtered).length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FiLayers size={40} className="text-gray-700 mb-4" />
              <p className="text-gray-400 font-medium">No sections found</p>
              <button onClick={openCreate} className="mt-4 text-blue-400 text-sm hover:text-blue-300">Create your first section</button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Section' : 'Add New Section'} size="xl">
        <div className="space-y-6">
          {/* Page & Section */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Page" required>
              <select value={form.page} onChange={e => setField('page', e.target.value)} className={selectCls}>
                {PAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Section">
              <select value={form.section} onChange={e => setField('section', e.target.value)} className={selectCls}>
                {(SECTIONS[form.page] || SECTIONS.home).map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Image */}
          <ImageUploadField
            value={form.image_url}
            onChange={setImageData}
            label="Section Image"
          />

          {/* Image position and layout */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Image Position">
              <select value={form.image_position} onChange={e => setField('image_position', e.target.value)} className={selectCls}>
                {IMAGE_POSITIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Content Align">
              <select value={form.content_align} onChange={e => setField('content_align', e.target.value)} className={selectCls}>
                {CONTENT_ALIGNS.map(a => <option key={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Background Color">
              <div className="flex gap-2">
                <input type="color" value={form.bg_color || '#FFFFFF'} onChange={e => setField('bg_color', e.target.value)}
                  className="w-9 h-9 rounded border border-gray-700 bg-gray-800 p-0.5 cursor-pointer" />
                <input type="text" value={form.bg_color || '#FFFFFF'} onChange={e => setField('bg_color', e.target.value)}
                  className={inputCls} />
              </div>
            </Field>
          </div>

          {/* Mini Title */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mini Title / Tag">
              <input type="text" value={form.mini_title || ''} onChange={e => setField('mini_title', e.target.value)}
                placeholder="e.g., Who We Are" className={inputCls} />
            </Field>
            <Field label="External URL">
              <input type="url" value={form.external_url || ''} onChange={e => setField('external_url', e.target.value)}
                placeholder="https://..." className={inputCls} />
            </Field>
          </div>

          {/* Title with styling */}
          <TextStyleField
            label="Title"
            valueKey="title"
            colorKey="title_color"
            fontKey="title_font"
            sizeKey="title_size"
            weightKey="title_weight"
            values={form}
            onChange={setField}
          />

          {/* Subtitle with styling */}
          <TextStyleField
            label="Subtitle"
            valueKey="subtitle"
            colorKey="subtitle_color"
            fontKey="subtitle_font"
            values={form}
            onChange={setField}
          />

          {/* Paragraph with color */}
          <div className="space-y-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <p className="text-gray-300 text-sm font-semibold">Paragraph / Description Styling</p>
            <Field label="Paragraph Text">
              <textarea value={form.paragraph || ''} onChange={e => setField('paragraph', e.target.value)}
                rows={4} placeholder="Enter paragraph text..." className={textareaCls} />
            </Field>
            <div className="flex gap-2 items-center">
              <input type="color" value={form.paragraph_color || '#6B7280'} onChange={e => setField('paragraph_color', e.target.value)}
                className="w-9 h-9 rounded border border-gray-700 bg-gray-800 p-0.5 cursor-pointer" />
              <input type="text" value={form.paragraph_color || '#6B7280'} onChange={e => setField('paragraph_color', e.target.value)}
                placeholder="Paragraph color" className={inputCls} />
            </div>
          </div>

          {/* Button */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Button Text">
              <input type="text" value={form.button_text || ''} onChange={e => setField('button_text', e.target.value)}
                placeholder="e.g., Learn More" className={inputCls} />
            </Field>
            <Field label="Button URL">
              <input type="text" value={form.button_url || ''} onChange={e => setField('button_url', e.target.value)}
                placeholder="/about" className={inputCls} />
            </Field>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sort Order">
              <input type="number" value={form.sort_order || 0} onChange={e => setField('sort_order', e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Status">
              <Toggle checked={!!form.is_active} onChange={v => setField('is_active', v)} label={form.is_active ? 'Active' : 'Inactive'} />
            </Field>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editItem ? 'Update Section' : 'Create Section'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
