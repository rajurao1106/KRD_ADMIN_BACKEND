import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

export const GET = withAuth(async function(request, { params }) {
  try {
    const enquiries = await query('SELECT * FROM enquiries WHERE id = ?', [params.id])
    if (!enquiries.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // Mark as read
    if (enquiries[0].status === 'new') {
      await query("UPDATE enquiries SET status = 'read' WHERE id = ?", [params.id])
    }
    return NextResponse.json({ enquiry: enquiries[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
})

export const PUT = withAuth(async function(request, { params }) {
  try {
    const data = await request.json()
    const allowed = ['status', 'notes']
    const setClauses = []
    const values = []
    
    allowed.forEach(field => {
      if (data[field] !== undefined) {
        setClauses.push(`${field} = ?`)
        values.push(data[field])
      }
    })
    
    if (!setClauses.length) return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
    
    values.push(params.id)
    await query(`UPDATE enquiries SET ${setClauses.join(', ')} WHERE id = ?`, values)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
})

export const DELETE = withAuth(async function(request, { params }) {
  try {
    await query('DELETE FROM enquiries WHERE id = ?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
})
