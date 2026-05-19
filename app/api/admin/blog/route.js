import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { saveUploadedFile } from '@/lib/upload'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const categoryId = searchParams.get('category_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
    
    let sql = `
      SELECT bp.*, bc.name as category_name, u.name as author_name
      FROM blog_posts bp
      LEFT JOIN blog_categories bc ON bp.category_id = bc.id
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE 1=1
    `
    const params = []
    
    if (status && status !== 'all') { sql += ' AND bp.status = ?'; params.push(status) }
    if (categoryId) { sql += ' AND bp.category_id = ?'; params.push(categoryId) }
    
    const countSql = sql.replace('SELECT bp.*, bc.name as category_name, u.name as author_name', 'SELECT COUNT(*) as total')
    const countResult = await query(countSql, params)
    const total = countResult[0].total
    
    sql += ` ORDER BY bp.published_at DESC, bp.created_at DESC LIMIT ${limit} OFFSET ${offset}`
    
    const posts = await query(sql, params)
    return NextResponse.json({ posts, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Blog GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export const POST = withAuth(async function(request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('featured_image')
    let imageUrl = null
    
    if (imageFile && imageFile.size > 0) {
      const uploaded = await saveUploadedFile(imageFile, 'blog')
      imageUrl = uploaded.fileUrl
    }
    
    const title = formData.get('title')
    const slug = formData.get('slug') || title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const status = formData.get('status') || 'draft'
    
    const result = await query(
      `INSERT INTO blog_posts 
       (category_id, author_id, title, slug, excerpt, content, featured_image, tags, status, is_featured, meta_title, meta_description, published_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        formData.get('category_id') || null,
        request.user?.id || null,
        title, slug,
        formData.get('excerpt') || null,
        formData.get('content') || null,
        imageUrl,
        formData.get('tags') || '[]',
        status,
        formData.get('is_featured') === '1' ? 1 : 0,
        formData.get('meta_title') || null,
        formData.get('meta_description') || null,
        status === 'published' ? new Date() : null,
      ]
    )
    
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
})
