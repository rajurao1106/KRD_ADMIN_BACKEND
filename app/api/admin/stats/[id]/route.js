import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

export const PUT = withAuth(async function(request, { params }) {
  try {
    const data = await request.json()

    const allowedFields = ['label', 'value', 'icon', 'suffix', 'prefix', 'sort_order', 'is_active']

    const setClauses = []
    const values = []

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        setClauses.push(`${field} = ?`)
        values.push(data[field])
      }
    })

    if (!setClauses.length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    values.push(params.id)
    await query(`UPDATE stats SET ${setClauses.join(', ')} WHERE id = ?`, values)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Stats PUT error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 })
  }
})

export const DELETE = withAuth(async function(request, { params }) {
  try {
    await query('DELETE FROM stats WHERE id = ?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Stats DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
})