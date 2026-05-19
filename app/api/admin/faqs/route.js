import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const activeOnly = searchParams.get('active') !== 'false'
    
    let sql = 'SELECT * FROM faqs WHERE 1=1'
    const params = []
    
    if (page) { sql += ' AND (page = ? OR page = "both")'; params.push(page) }
    if (activeOnly) { sql += ' AND is_active = 1' }
    sql += ' ORDER BY sort_order ASC, created_at ASC'
    
    const faqs = await query(sql, params)
    return NextResponse.json({ faqs })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

export const POST = withAuth(async function(request) {
  try {
    const data = await request.json()
    
    if (!data.question || !data.answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 })
    }
    
    const result = await query(
      `INSERT INTO faqs (question, answer, category, page, sort_order, is_active)
       VALUES (?,?,?,?,?,?)`,
      [data.question, data.answer, data.category || 'General', data.page || 'faq', data.sort_order || 0, data.is_active !== false ? 1 : 0]
    )
    
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
  }
})
