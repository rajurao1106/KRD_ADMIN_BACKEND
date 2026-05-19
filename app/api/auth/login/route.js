import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { comparePassword, generateToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    const users = await query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email])
    
    if (!users.length) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const user = users[0]
    const isValid = await comparePassword(password, user.password)
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id])
    
    const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    
    const response = NextResponse.json({ 
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    })
    
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
