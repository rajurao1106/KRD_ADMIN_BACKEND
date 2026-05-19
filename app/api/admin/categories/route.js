import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { saveUploadedFile } from '@/lib/upload'

export async function GET() {
  try {
    const categories = await query(
      `SELECT c.*, p.name as parent_name,
       (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = 1) as product_count
       FROM product_categories c
       LEFT JOIN product_categories p ON c.parent_id = p.id
       ORDER BY c.sort_order ASC, c.name ASC`
    )
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export const POST = withAuth(async function(request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let name, slug, description, parent_id, sort_order, is_active, image_url
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      name = formData.get('name')
      slug = formData.get('slug') || name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      description = formData.get('description')
      parent_id = formData.get('parent_id') || null
      sort_order = formData.get('sort_order') || 0
      is_active = formData.get('is_active') !== '0' ? 1 : 0
      
      const imageFile = formData.get('image')
      if (imageFile && imageFile.size > 0) {
        const uploaded = await saveUploadedFile(imageFile, 'categories')
        image_url = uploaded.fileUrl
      }
    } else {
      const data = await request.json()
      name = data.name
      slug = data.slug || name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      description = data.description
      parent_id = data.parent_id || null
      sort_order = data.sort_order || 0
      is_active = data.is_active !== false ? 1 : 0
    }
    
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    
    const result = await query(
      `INSERT INTO product_categories (name, slug, description, image_url, parent_id, sort_order, is_active)
       VALUES (?,?,?,?,?,?,?)`,
      [name, slug, description || null, image_url || null, parent_id, sort_order, is_active]
    )
    
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error(error)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
})
