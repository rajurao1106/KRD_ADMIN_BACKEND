import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    let sql = `
      SELECT p.*, pc.name as category_name, pc.slug as category_slug 
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.is_active = 1
    `
    const params = []

    if (categoryId) { sql += ' AND p.category_id = ?'; params.push(categoryId) }
    if (featured === '1') { sql += ' AND p.is_featured = 1' }
    if (search) { sql += ' AND (p.name LIKE ? OR p.short_description LIKE ? OR p.slug LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`) }

    const countSql = sql.replace('SELECT p.*, pc.name as category_name, pc.slug as category_slug', 'SELECT COUNT(*) as total')
    const countResult = await query(countSql, params)
    const total = countResult[0].total

    sql += ` ORDER BY p.sort_order ASC, p.created_at DESC LIMIT ${limit} OFFSET ${offset}`

    const products = await query(sql, params)
    return NextResponse.json({ products, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
