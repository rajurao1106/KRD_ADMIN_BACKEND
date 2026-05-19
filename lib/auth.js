import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'krd-clean-care-super-secret-2024'
const JWT_EXPIRES_IN = '7d'
const COOKIE_NAME = 'krd_admin_token'

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export async function getTokenFromCookies() {
  try {
    const cookieStore = await cookies()
    return cookieStore.get(COOKIE_NAME)?.value || null
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const token = await getTokenFromCookies()
  if (!token) return null
  return verifyToken(token)
}

export function isAdmin(user) {
  return user && (user.role === 'admin' || user.role === 'superadmin')
}

export function isSuperAdmin(user) {
  return user && user.role === 'superadmin'
}

export { COOKIE_NAME }
