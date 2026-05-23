import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

export async function GET(request, context) {
  try {
    const { id } = await context.params
    const faqs = await query('SELECT * FROM faqs WHERE id = ?', [id])
    if (!faqs.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ faq: faqs[0] })
  } catch (error) {
    console.error('FAQ GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export const PUT = withAuth(async function(request, { params }) {
  try {
    const data = await request.json()

    // ✅ Allowlist — never trust raw Object.keys(data) in SQL
    const allowedFields = ['question', 'answer', 'category', 'page', 'sort_order', 'is_active']

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
    await query(`UPDATE faqs SET ${setClauses.join(', ')} WHERE id = ?`, values)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('FAQ PUT error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 })
  }
})

export const DELETE = withAuth(async function(request, { params }) {
  try {
    await query('DELETE FROM faqs WHERE id = ?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('FAQ DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
})