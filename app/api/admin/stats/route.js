import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

export async function GET() {
  try {
    const stats = await query('SELECT * FROM stats WHERE is_active = 1 ORDER BY sort_order ASC')
    return NextResponse.json({ stats })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

export const POST = withAuth(async function(request) {
  try {
    const data = await request.json()
    const result = await query(
      'INSERT INTO stats (label, value, icon, bg_color, icon_color, sort_order, is_active) VALUES (?,?,?,?,?,?,?)',
      [data.label, data.value, data.icon || null, data.bg_color || '#e1f3d0', data.icon_color || '#0056B3', data.sort_order || 0, 1]
    )
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create stat' }, { status: 500 })
  }
})
