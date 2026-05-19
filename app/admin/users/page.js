'use client'

import { useState, useEffect } from 'react'
import { FiPlus, FiUsers, FiShield, FiUser } from 'react-icons/fi'
import { Modal, Field, inputCls, selectCls, PageHeader, AdminTable, StatusBadge, Toggle } from '@/components/admin/AdminComponents'

const defaultForm = { name: '', email: '', password: '', role: 'admin', is_active: true }

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    fetchCurrentUser()
    fetchUsers()
  }, [])

  async function fetchCurrentUser() {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    setCurrentUser(data.user)
  }

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (!res.ok) {
      setLoading(false)
      return
    }
    const data = await res.json()
    setUsers(data.users || [])
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
    setForm({ name: item.name, email: item.email, password: '', role: item.role, is_active: item.is_active === 1 || item.is_active === true })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.email) return showToast('Name and email required', 'error')
    if (!editItem && !form.password) return showToast('Password required for new users', 'error')
    setSaving(true)
    try {
      const body = { ...form, is_active: form.is_active ? 1 : 0 }
      if (editItem && !body.password) delete body.password

      const url = editItem ? `/api/admin/users/${editItem.id}` : '/api/admin/users'
      const res = await fetch(url, {
        method: editItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      showToast(editItem ? 'User updated!' : 'User created!')
      setModalOpen(false)
      fetchUsers()
    } catch (e) {
      showToast(e.message || 'Failed to save user', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (id === currentUser?.id) return showToast('Cannot delete your own account', 'error')
    if (!confirm('Delete this user?')) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (!res.ok) { const d = await res.json(); return showToast(d.error, 'error') }
    showToast('User deleted')
    fetchUsers()
  }

  const columns = [
    {
      key: 'name', label: 'User',
      render: row => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${row.role === 'superadmin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
            <span className="text-white font-bold text-xs">{row.name?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">{row.name}</p>
            <p className="text-gray-500 text-xs">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role', label: 'Role',
      render: row => (
        <span className={`flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-0.5 rounded-full ${row.role === 'superadmin' ? 'bg-purple-900/50 text-purple-400' : 'bg-blue-900/50 text-blue-400'}`}>
          {row.role === 'superadmin' ? <FiShield size={10} /> : <FiUser size={10} />}
          {row.role}
        </span>
      )
    },
    { key: 'is_active', label: 'Status', render: row => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
    { key: 'last_login', label: 'Last Login', render: row => row.last_login ? new Date(row.last_login).toLocaleDateString() : <span className="text-gray-600">Never</span> },
    { key: 'created_at', label: 'Created', render: row => new Date(row.created_at).toLocaleDateString() },
  ]

  if (currentUser && currentUser.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FiShield size={48} className="text-gray-700 mb-4" />
        <p className="text-white font-semibold mb-2">Superadmin Access Required</p>
        <p className="text-gray-500 text-sm">Only superadmins can manage users.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-green-900 text-green-200 border border-green-700'}`}>
          {toast.msg}
        </div>
      )}

      <PageHeader
        title="Admin Users"
        description="Manage admin and superadmin accounts"
        action={
          <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <FiPlus size={16} /> Add User
          </button>
        }
      />

      {/* Info banner */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <FiShield size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-blue-300 font-medium">Role Permissions</p>
          <p className="text-blue-400/70 mt-1">
            <strong className="text-purple-400">Superadmin</strong> — Full access including user management, all settings.<br />
            <strong className="text-blue-400">Admin</strong> — Access to content, products, blog, FAQs, enquiries.
          </p>
        </div>
      </div>

      <AdminTable columns={columns} data={users} loading={loading} onEdit={openEdit} onDelete={handleDelete} emptyMessage="No users found" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit User' : 'Add User'} size="md">
        <div className="space-y-5">
          <Field label="Full Name" required>
            <input type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Admin Name" className={inputCls} />
          </Field>

          <Field label="Email Address" required>
            <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="admin@email.com" className={inputCls} />
          </Field>

          <Field label={editItem ? 'New Password (leave blank to keep)' : 'Password'} required={!editItem}>
            <input type="password" value={form.password} onChange={e => setField('password', e.target.value)} placeholder="••••••••" className={inputCls} />
          </Field>

          <Field label="Role">
            <select value={form.role} onChange={e => setField('role', e.target.value)} className={selectCls}>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </Field>

          <Toggle checked={!!form.is_active} onChange={v => setField('is_active', v)} label="Active Account" />

          <div className="flex gap-3 pt-4 border-t border-gray-800">
            <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editItem ? 'Update User' : 'Create User'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
