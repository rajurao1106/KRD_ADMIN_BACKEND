import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

export async function GET() {
  try {
    const categories = await query('SELECT * FROM blog_categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC')
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog categories' }, { status: 500 })
  }
}

export const POST = withAuth(async function(request) {
  try {
    const data = await request.json()
    if (!data.name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const result = await query(
      'INSERT INTO blog_categories (name, slug, description, sort_order, is_active) VALUES (?,?,?,?,?)',
      [data.name, slug, data.description || null, data.sort_order || 0, 1]
    )
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blog category' }, { status: 500 })
  }
})
