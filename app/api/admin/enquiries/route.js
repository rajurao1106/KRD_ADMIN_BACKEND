import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

// Public POST - submit enquiry from contact form
export async function POST(request) {
  try {
    const data = await request.json()
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    if (!data.first_name || !data.email || !data.message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
    }
    
    const result = await query(
      `INSERT INTO enquiries (type, first_name, last_name, email, phone, subject, message, product_interest, ip_address)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        data.type || 'contact',
        data.first_name, data.last_name || null,
        data.email, data.phone || null,
        data.subject || null, data.message,
        data.product_interest || null, ip
      ]
    )
    
    return NextResponse.json({ success: true, id: result.insertId, message: 'Your enquiry has been submitted successfully!' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
  }
}

// Admin GET - list enquiries
export const GET = withAuth(async function(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    
    let sql = 'SELECT * FROM enquiries WHERE 1=1'
    const params = []
    
    if (status) { sql += ' AND status = ?'; params.push(status) }
    if (type) { sql += ' AND type = ?'; params.push(type) }
    
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total')
    const countResult = await query(countSql, params)
    const total = countResult[0].total
    
    sql += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    
    const enquiries = await query(sql, params)
    return NextResponse.json({ enquiries, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 })
  }
})
