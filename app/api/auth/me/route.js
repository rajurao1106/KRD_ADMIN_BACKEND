import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const userToken = await getCurrentUser()
    if (!userToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const users = await query('SELECT id, name, email, role, avatar, last_login FROM users WHERE id = ? AND is_active = 1', [userToken.id])
    
    if (!users.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({ user: users[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
