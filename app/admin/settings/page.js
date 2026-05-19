'use client'

import { useState, useEffect } from 'react'
import { FiSettings, FiSave } from 'react-icons/fi'
import { Field, inputCls, textareaCls, PageHeader } from '@/components/admin/AdminComponents'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => { fetchSettings() }, [])

  async function fetchSettings() {
    setLoading(true)
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    setSettings(data.settings || {})
    setLoading(false)
  }

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function setField(key, val) { setSettings(prev => ({ ...prev, [key]: val })) }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (!res.ok) throw new Error()
      showToast('Settings saved!')
    } catch {
      showToast('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Social Media' },
    { id: 'seo', label: 'SEO' },
  ]

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-green-900 text-green-200 border border-green-700'}`}>
          {toast.msg}
        </div>
      )}

      <PageHeader
        title="Site Settings"
        description="Configure your website settings"
        action={
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave size={16} />}
            Save Settings
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded animate-pulse" />)}</div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          {activeTab === 'general' && (
            <div className="space-y-5">
              <h2 className="text-white font-semibold mb-4">General Settings</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Site Name">
                  <input type="text" value={settings.site_name || ''} onChange={e => setField('site_name', e.target.value)} className={inputCls} placeholder="KRD Clean And Care" />
                </Field>
                <Field label="Site Tagline">
                  <input type="text" value={settings.site_tagline || ''} onChange={e => setField('site_tagline', e.target.value)} className={inputCls} placeholder="India's B2B Cleaning Products Supplier" />
                </Field>
              </div>
              <Field label="Logo URL">
                <input type="text" value={settings.site_logo || ''} onChange={e => setField('site_logo', e.target.value)} className={inputCls} placeholder="/navbar/logo.png" />
                {settings.site_logo && <img src={settings.site_logo} alt="Logo" className="h-12 mt-2 object-contain" />}
              </Field>
              <Field label="Primary Color">
                <div className="flex gap-2">
                  <input type="color" value={settings.primary_color || '#0056B3'} onChange={e => setField('primary_color', e.target.value)}
                    className="w-9 h-9 rounded border border-gray-700 bg-gray-800 cursor-pointer" />
                  <input type="text" value={settings.primary_color || '#0056B3'} onChange={e => setField('primary_color', e.target.value)} className={inputCls} />
                </div>
              </Field>
              <Field label="Footer Copyright Text">
                <input type="text" value={settings.footer_copyright || ''} onChange={e => setField('footer_copyright', e.target.value)} className={inputCls} placeholder="KRD Clean And Care. All rights reserved." />
              </Field>
              <Field label="Developer Credit">
                <input type="text" value={settings.developer_credit || ''} onChange={e => setField('developer_credit', e.target.value)} className={inputCls} placeholder="DigiKraft Social" />
              </Field>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-5">
              <h2 className="text-white font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email Address">
                  <input type="email" value={settings.site_email || ''} onChange={e => setField('site_email', e.target.value)} className={inputCls} placeholder="info@krdcleanandcare.com" />
                </Field>
                <Field label="Phone Number">
                  <input type="text" value={settings.site_phone || ''} onChange={e => setField('site_phone', e.target.value)} className={inputCls} placeholder="08048966524" />
                </Field>
              </div>
              <Field label="Address">
                <textarea value={settings.site_address || ''} onChange={e => setField('site_address', e.target.value)} rows={3} className={textareaCls} placeholder="Full address..." />
              </Field>
              <Field label="Working Hours">
                <input type="text" value={settings.working_hours || ''} onChange={e => setField('working_hours', e.target.value)} className={inputCls} placeholder="Monday - Saturday: 10:00 AM - 07:00 PM" />
              </Field>
              <Field label="Google Maps Embed URL">
                <textarea value={settings.google_maps_embed || ''} onChange={e => setField('google_maps_embed', e.target.value)} rows={4} className={textareaCls} placeholder="https://www.google.com/maps/embed?..." />
              </Field>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-5">
              <h2 className="text-white font-semibold mb-4">Social Media Links</h2>
              {[
                { key: 'facebook_url', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
                { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                { key: 'twitter_url', label: 'Twitter/X URL', placeholder: 'https://twitter.com/...' },
                { key: 'youtube_url', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
                { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/...' },
                { key: 'indiamart_url', label: 'IndiaMART URL', placeholder: 'https://indiamart.com/...' },
              ].map(({ key, label, placeholder }) => (
                <Field key={key} label={label}>
                  <input type="url" value={settings[key] || ''} onChange={e => setField(key, e.target.value)} className={inputCls} placeholder={placeholder} />
                </Field>
              ))}
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-5">
              <h2 className="text-white font-semibold mb-4">SEO Settings</h2>
              <Field label="Meta Title">
                <input type="text" value={settings.meta_title || ''} onChange={e => setField('meta_title', e.target.value)} className={inputCls} placeholder="KRD Clean And Care - India's B2B Cleaning Products Supplier" />
              </Field>
              <Field label="Meta Description">
                <textarea value={settings.meta_description || ''} onChange={e => setField('meta_description', e.target.value)} rows={3} className={textareaCls} placeholder="Premium manufacturing of eco-friendly hygiene solutions..." />
              </Field>
              <Field label="Meta Keywords">
                <input type="text" value={settings.meta_keywords || ''} onChange={e => setField('meta_keywords', e.target.value)} className={inputCls} placeholder="cleaning products, floor cleaner, toilet cleaner, Raipur" />
              </Field>
              <Field label="Google Analytics ID">
                <input type="text" value={settings.google_analytics_id || ''} onChange={e => setField('google_analytics_id', e.target.value)} className={inputCls} placeholder="G-XXXXXXXXXX" />
              </Field>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
