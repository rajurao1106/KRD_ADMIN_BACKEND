'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage, FiLink } from 'react-icons/fi'

// ===================== IMAGE UPLOAD FIELD =====================
export function ImageUploadField({ value, onChange, label = 'Image', folder = 'general' }) {
  const [preview, setPreview] = useState(value)
  const [mode, setMode] = useState('upload') // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState(value || '')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  function handleFile(file) {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange({ file, fileUrl: null })
  }

  function handleUrl() {
    setPreview(urlInput)
    onChange({ file: null, fileUrl: urlInput })
  }

  return (
    <div className="space-y-2">
      <label className="block text-gray-400 text-sm font-medium">{label}</label>
      
      {/* Mode Toggle */}
      <div className="flex gap-1 mb-2">
        <button type="button" onClick={() => setMode('upload')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${mode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          <FiUpload size={12} /> Upload
        </button>
        <button type="button" onClick={() => setMode('url')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${mode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          <FiLink size={12} /> URL
        </button>
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragging ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-500'
          }`}
        >
          {preview ? (
            <div className="relative inline-block">
              <img src={preview} alt="Preview" className="max-h-40 max-w-full rounded-lg mx-auto object-contain" />
              <button type="button" onClick={e => { e.stopPropagation(); setPreview(null); onChange(null) }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600">
                <FiX size={12} />
              </button>
            </div>
          ) : (
            <>
              <FiImage size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Click or drag image here</p>
              <p className="text-gray-700 text-xs mt-1">JPG, PNG, WebP up to 10MB</p>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 bg-gray-800 border border-gray-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
          />
          <button type="button" onClick={handleUrl} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Set
          </button>
        </div>
      )}
      {mode === 'url' && preview && (
        <img src={preview} alt="Preview" className="max-h-32 rounded-lg object-contain mt-2" onError={() => setPreview(null)} />
      )}
    </div>
  )
}

// ===================== TEXT STYLE FIELD =====================
export function TextStyleField({ label, valueKey, colorKey, fontKey, sizeKey, weightKey, values, onChange }) {
  const fonts = ['Lato', 'Poppins', 'Georgia', 'Arial', 'Inter', 'sans-serif']
  const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl']
  const weights = ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'bold', 'semibold', 'medium', 'light']

  return (
    <div className="space-y-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
      <p className="text-gray-300 text-sm font-semibold">{label} Styling</p>
      
      <div>
        <label className="block text-gray-500 text-xs mb-1">{label} Text</label>
        <textarea
          value={values[valueKey] || ''}
          onChange={e => onChange(valueKey, e.target.value)}
          rows={2}
          className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 resize-none"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-500 text-xs mb-1">Color</label>
          <div className="flex gap-2">
            <input type="color" value={values[colorKey] || '#111827'} onChange={e => onChange(colorKey, e.target.value)}
              className="w-9 h-9 rounded cursor-pointer border border-gray-700 bg-gray-800 p-0.5" />
            <input type="text" value={values[colorKey] || '#111827'} onChange={e => onChange(colorKey, e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        
        {fontKey && (
          <div>
            <label className="block text-gray-500 text-xs mb-1">Font</label>
            <select value={values[fontKey] || 'Lato'} onChange={e => onChange(fontKey, e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              {fonts.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
        )}
        
        {sizeKey && (
          <div>
            <label className="block text-gray-500 text-xs mb-1">Size</label>
            <select value={values[sizeKey] || '4xl'} onChange={e => onChange(sizeKey, e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              {sizes.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        )}
        
        {weightKey && (
          <div>
            <label className="block text-gray-500 text-xs mb-1">Weight</label>
            <select value={values[weightKey] || 'bold'} onChange={e => onChange(weightKey, e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
              {weights.map(w => <option key={w}>{w}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

// ===================== ADMIN TABLE =====================
export function AdminTable({ columns, data, onEdit, onDelete, loading, emptyMessage = 'No items found' }) {
  if (loading) return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 bg-gray-800/50 rounded-xl animate-pulse" />
      ))}
    </div>
  )

  if (!data?.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-900/50 border border-gray-800 rounded-xl">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <FiImage size={24} className="text-gray-600" />
      </div>
      <p className="text-gray-400 font-medium">{emptyMessage}</p>
    </div>
  )

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/80 border-b border-gray-800">
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th className="text-right px-4 py-3 text-gray-500 text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {data.map((row, i) => (
              <tr key={row.id || i} className="bg-gray-900/40 hover:bg-gray-800/50 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-300">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onEdit && (
                      <button onClick={() => onEdit(row)} className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => { if (confirm('Delete this item?')) onDelete(row.id) }} className="text-xs px-3 py-1.5 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg transition-colors">
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.map((row, i) => (
          <div key={row.id || i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                {columns.slice(0, 3).map(col => (
                  <div key={col.key} className="text-sm">
                    {col.render ? col.render(row) : <span className="text-gray-300">{row[col.key] ?? '—'}</span>}
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 ml-3">
                {onEdit && (
                  <button onClick={() => onEdit(row)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                    <FiUpload size={14} />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => { if (confirm('Delete this item?')) onDelete(row.id) }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
                    <FiX size={14} />
                  </button>
                )}
              </div>
            </div>
            {columns.length > 3 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
                {columns.slice(3).map(col => (
                  <div key={col.key} className="text-xs text-gray-500">
                    <span className="text-gray-600">{col.label}: </span>
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

// ===================== MODAL =====================
export function Modal({ isOpen, onClose, title, children, size = 'lg' }) {
  if (!isOpen) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-gray-900 border border-gray-800 sm:rounded-2xl rounded-t-2xl shadow-2xl w-full ${sizes[size]} max-h-[95vh] sm:max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
          <h2 className="text-white font-semibold text-base sm:text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors">
            <FiX size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// ===================== INPUT FIELD =====================
export function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-gray-400 text-sm font-medium mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

export const inputCls = "w-full bg-gray-800 border border-gray-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
export const selectCls = "w-full bg-gray-800 border border-gray-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
export const textareaCls = "w-full bg-gray-800 border border-gray-700 text-white px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 resize-none"

// ===================== TOGGLE =====================
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-700'}`} onClick={() => onChange(!checked)}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
      {label && <span className="text-gray-400 text-sm">{label}</span>}
    </label>
  )
}

// ===================== PAGE HEADER =====================
export function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ===================== STATUS BADGE =====================
export function StatusBadge({ status }) {
  const styles = {
    active: 'bg-green-900/50 text-green-400',
    inactive: 'bg-gray-800 text-gray-500',
    published: 'bg-green-900/50 text-green-400',
    draft: 'bg-yellow-900/50 text-yellow-400',
    archived: 'bg-gray-800 text-gray-500',
    new: 'bg-blue-900/50 text-blue-400',
    read: 'bg-gray-800 text-gray-400',
    replied: 'bg-green-900/50 text-green-400',
    closed: 'bg-gray-900 text-gray-600',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${styles[status] || styles.inactive}`}>
      {status}
    </span>
  )
}
