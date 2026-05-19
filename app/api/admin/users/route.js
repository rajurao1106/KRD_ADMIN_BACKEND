import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { hashPassword } from '@/lib/auth'

export const GET = withAuth(async function(request) {
  try {
    const users = await query('SELECT id, name, email, role, is_active, avatar, last_login, created_at FROM users ORDER BY created_at DESC')
    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}, { requireSuperAdmin: true })

export const POST = withAuth(async function(request) {
  try {
    const data = await request.json()
    
    if (!data.name || !data.email || !data.password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }
    
    const hashed = await hashPassword(data.password)
    
    const result = await query(
      'INSERT INTO users (name, email, password, role, is_active) VALUES (?,?,?,?,?)',
      [data.name, data.email, hashed, data.role || 'admin', data.is_active !== false ? 1 : 0]
    )
    
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}, { requireSuperAdmin: true })
