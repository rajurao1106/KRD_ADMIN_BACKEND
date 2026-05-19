'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiPackage, FiEdit2, FiTrash2, FiFilter, FiGrid, FiList } from 'react-icons/fi'
import { Modal, Field, inputCls, textareaCls, selectCls, PageHeader, StatusBadge, Toggle, ImageUploadField } from '@/components/admin/AdminComponents'
import Link from 'next/link'

const defaultForm = {
  category_ids: [], name: '', slug: '', short_description: '', description: '',
  price: '', old_price: '', sku: '', stock_quantity: 0, weight: '', volume: '',
  is_featured: false, is_new: false, is_active: true, sort_order: 0,
  meta_title: '', meta_description: ''
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [imageFiles, setImageFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [toast, setToast] = useState(null)
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => { fetchData() }, [page, search, filterCat])
  useEffect(() => { fetchCategories() }, [])

  async function fetchData() {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 12, active: false })
    if (search) params.set('search', search)
    if (filterCat) params.set('category_id', filterCat)
    const res = await fetch(`/api/admin/products?${params}`)
    const data = await res.json()
    setProducts(data.products || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  async function fetchCategories() {
    const res = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data.categories || [])
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
    setImageFiles([])
    setModalOpen(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setForm({
      ...item,
      category_ids: item.categories ? item.categories.map(c => String(c.id)) : (item.category_id ? [String(item.category_id)] : []),
      is_featured: item.is_featured === 1 || item.is_featured === true,
      is_new: item.is_new === 1 || item.is_new === true,
      is_active: item.is_active === 1 || item.is_active === true,
    })
    setImageFiles([])
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name) return showToast('Product name is required', 'error')
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'category_ids') {
          fd.append('category_ids', JSON.stringify(v))
          if (v.length > 0) fd.append('category_id', v[0])
        } else if (v !== null && v !== undefined) {
          fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v))
        }
      })
      imageFiles.forEach(f => fd.append('images', f))

      const url = editItem ? `/api/admin/products/${editItem.id}` : '/api/admin/products'
      const res = await fetch(url, { method: editItem ? 'PUT' : 'POST', body: fd })
      if (!res.ok) throw new Error()

      showToast(editItem ? 'Product updated!' : 'Product created!')
      setModalOpen(false)
      fetchData()
    } catch {
      showToast('Failed to save product', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    showToast('Product deleted')
    fetchData()
  }

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right ${toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-green-900 text-green-200 border border-green-700'}`}>
          {toast.msg}
        </div>
      )}

      <PageHeader
        title="Products"
        description={`${total} products total`}
        action={
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-600/20">
            <FiPlus size={16} /> Add Product
          </button>
        }
      />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products..." className="w-full bg-gray-800/60 border border-gray-700/50 text-white pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-600 transition-all" />
        </div>
        <div className="flex gap-2">
          <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }} className="bg-gray-800/60 border border-gray-700/50 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="hidden sm:flex bg-gray-800/60 border border-gray-700/50 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              <FiGrid size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              <FiList size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-800" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
                <div className="h-5 bg-gray-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 border border-gray-800 rounded-xl">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <FiPackage size={28} className="text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium">No products found</p>
          <p className="text-gray-600 text-sm mt-1">Start by adding your first product</p>
          <button onClick={openCreate} className="mt-4 text-blue-400 text-sm hover:text-blue-300 transition-colors">+ Add Product</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => {
            const images = (() => { try { return JSON.parse(product.images || '[]') } catch { return [] } })()
            const img = product.featured_image || images[0]

            return (
              <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 hover:shadow-xl hover:shadow-black/20 transition-all group">
                <div className="aspect-square bg-gray-800 relative overflow-hidden">
                  {img ? (
                    <img src={img} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiPackage size={32} className="text-gray-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {product.is_featured === 1 && <span className="bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">FEATURED</span>}
                    {product.is_new === 1 && <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">NEW</span>}
                    {product.is_active !== 1 && <span className="bg-gray-700 text-gray-300 text-[10px] font-bold px-1.5 py-0.5 rounded">DRAFT</span>}
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(product)} className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                      <FiEdit2 size={16} className="text-white" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/20 backdrop-blur-sm rounded-lg hover:bg-red-500/40 transition-colors">
                      <FiTrash2 size={16} className="text-red-300" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">{product.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{product.categories?.length > 0 ? product.categories.map(c => c.name).join(', ') : product.category_name || 'No category'}</p>
                  <div className="flex items-center justify-between mt-2">
                    {product.price ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-blue-400 text-sm font-bold">₹{product.price}</span>
                        {product.old_price && <span className="text-gray-600 text-xs line-through">₹{product.old_price}</span>}
                      </div>
                    ) : <span className="text-gray-600 text-xs">No price</span>}
                    {product.sku && <span className="text-gray-600 text-[10px] font-mono">{product.sku}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-800">
            {products.map(product => {
              const images = (() => { try { return JSON.parse(product.images || '[]') } catch { return [] } })()
              const img = product.featured_image || images[0]
              return (
                <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="w-14 h-14 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {img ? <img src={img} alt="" className="w-full h-full object-contain p-1" /> : <div className="w-full h-full flex items-center justify-center"><FiPackage size={20} className="text-gray-600" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                    <p className="text-gray-500 text-xs">{product.categories?.length > 0 ? product.categories.map(c => c.name).join(', ') : product.category_name || 'No category'} {product.sku && `• ${product.sku}`}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    {product.is_active === 1 ? <StatusBadge status="active" /> : <StatusBadge status="inactive" />}
                    {product.price && <span className="text-blue-400 font-bold text-sm">₹{product.price}</span>}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(product)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"><FiTrash2 size={14} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3">
          <p className="text-gray-500 text-sm">Showing {(page-1)*12+1}-{Math.min(page*12, total)} of {total}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm disabled:opacity-30 hover:bg-gray-700 transition-colors">← Prev</button>
            <span className="text-gray-400 text-sm px-2">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm disabled:opacity-30 hover:bg-gray-700 transition-colors">Next →</button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Product' : 'Add New Product'} size="xl">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Product Name" required>
              <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Product name" className={inputCls} />
            </Field>
            <Field label="Categories (select multiple)">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-xs p-2">No categories available</p>
                ) : categories.map(c => {
                  const isSelected = (form.category_ids || []).includes(String(c.id))
                  return (
                    <label key={c.id} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-gray-700/50 border border-transparent'}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const ids = form.category_ids || []
                          if (isSelected) {
                            setField('category_ids', ids.filter(id => id !== String(c.id)))
                          } else {
                            setField('category_ids', [...ids, String(c.id)])
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-gray-400'}`}>{c.name}</span>
                    </label>
                  )
                })}
              </div>
              {(form.category_ids || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(form.category_ids || []).map(id => {
                    const cat = categories.find(c => String(c.id) === id)
                    return cat ? (
                      <span key={id} className="inline-flex items-center gap-1 bg-blue-900/40 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-500/20">
                        {cat.name}
                        <button type="button" onClick={() => setField('category_ids', (form.category_ids || []).filter(i => i !== id))} className="text-blue-400 hover:text-white ml-0.5">×</button>
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </Field>
          </div>

          <Field label="URL Slug">
            <input type="text" value={form.slug} onChange={e => setField('slug', e.target.value)} placeholder="product-url-slug" className={inputCls} />
          </Field>

          <Field label="Short Description">
            <textarea value={form.short_description || ''} onChange={e => setField('short_description', e.target.value)} rows={2} className={textareaCls} placeholder="Brief product description..." />
          </Field>

          <Field label="Full Description">
            <textarea value={form.description || ''} onChange={e => setField('description', e.target.value)} rows={5} className={textareaCls} placeholder="Detailed product description..." />
          </Field>

          {/* Images */}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Product Images (multiple)</label>
            <input type="file" accept="image/*" multiple onChange={e => setImageFiles(Array.from(e.target.files))}
              className="w-full bg-gray-800 border border-gray-700 text-gray-400 px-3 py-2 rounded-lg text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
            {imageFiles.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {imageFiles.map((f, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(f)} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-700" />
                    <button type="button" onClick={() => setImageFiles(prev => prev.filter((_, j) => j !== i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">×</button>
                  </div>
                ))}
              </div>
            )}
            {editItem?.featured_image && imageFiles.length === 0 && (
              <img src={editItem.featured_image} alt="Current" className="w-16 h-16 object-cover rounded-lg mt-2 border border-gray-700" />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Price (₹)">
              <input type="number" value={form.price || ''} onChange={e => setField('price', e.target.value)} placeholder="0.00" step="0.01" className={inputCls} />
            </Field>
            <Field label="Old Price (₹)">
              <input type="number" value={form.old_price || ''} onChange={e => setField('old_price', e.target.value)} placeholder="0.00" step="0.01" className={inputCls} />
            </Field>
            <Field label="SKU">
              <input type="text" value={form.sku || ''} onChange={e => setField('sku', e.target.value)} placeholder="KRD-001" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Weight">
              <input type="text" value={form.weight || ''} onChange={e => setField('weight', e.target.value)} placeholder="1kg" className={inputCls} />
            </Field>
            <Field label="Volume">
              <input type="text" value={form.volume || ''} onChange={e => setField('volume', e.target.value)} placeholder="500ml" className={inputCls} />
            </Field>
            <Field label="Sort Order">
              <input type="number" value={form.sort_order || 0} onChange={e => setField('sort_order', e.target.value)} className={inputCls} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-6">
            <Toggle checked={!!form.is_active} onChange={v => setField('is_active', v)} label="Active" />
            <Toggle checked={!!form.is_featured} onChange={v => setField('is_featured', v)} label="Featured" />
            <Toggle checked={!!form.is_new} onChange={v => setField('is_new', v)} label="New" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Meta Title">
              <input type="text" value={form.meta_title || ''} onChange={e => setField('meta_title', e.target.value)} placeholder="SEO Title" className={inputCls} />
            </Field>
            <Field label="Meta Description">
              <input type="text" value={form.meta_description || ''} onChange={e => setField('meta_description', e.target.value)} placeholder="SEO Description" className={inputCls} />
            </Field>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editItem ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
