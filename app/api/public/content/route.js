import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')

    let sql = 'SELECT * FROM content_sections WHERE is_active = 1'
    const params = []

    if (page) {
      sql += ' AND page = ?'
      params.push(page)
    }

    sql += ' ORDER BY page, section, sort_order ASC'

    const rows = await query(sql, params)

    // Group by page and section
    const grouped = {}
    rows.forEach(row => {
      if (!grouped[row.page]) grouped[row.page] = {}
      if (!grouped[row.page][row.section]) grouped[row.page][row.section] = []
      grouped[row.page][row.section].push(row)
    })

    return NextResponse.json({ sections: rows, grouped })
  } catch (error) {
    console.error('Public content error:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}
