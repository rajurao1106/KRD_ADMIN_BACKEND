import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'

export const PUT = withAuth(async function(request, { params }) {
  try {
    const data = await request.json()
    
    // Allow self-update for non-superadmins
    const currentUser = request.user
    const isSelf = currentUser.id === parseInt(params.id)
    const isSuperAdmin = currentUser.role === 'superadmin'
    
    if (!isSelf && !isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const setClauses = []
    const values = []
    
    if (data.name) { setClauses.push('name = ?'); values.push(data.name) }
    if (data.email && isSuperAdmin) { setClauses.push('email = ?'); values.push(data.email) }
    if (data.role && isSuperAdmin) { setClauses.push('role = ?'); values.push(data.role) }
    if (data.is_active !== undefined && isSuperAdmin) { setClauses.push('is_active = ?'); values.push(data.is_active ? 1 : 0) }
    if (data.password) {
      const hashed = await hashPassword(data.password)
      setClauses.push('password = ?')
      values.push(hashed)
    }
    
    if (!setClauses.length) return NextResponse.json({ error: 'No data to update' }, { status: 400 })
    
    values.push(params.id)
    await query(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`, values)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
})

export const DELETE = withAuth(async function(request, { params }) {
  try {
    const currentUser = request.user
    if (currentUser.id === parseInt(params.id)) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }
    await query('DELETE FROM users WHERE id = ?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}, { requireSuperAdmin: true })
