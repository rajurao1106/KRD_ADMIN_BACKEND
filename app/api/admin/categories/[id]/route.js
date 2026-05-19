import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { saveUploadedFile, deleteFile } from '@/lib/upload'

export async function GET(request, context) {
  try {
    const { id } = await context.params
    const cats = await query('SELECT * FROM product_categories WHERE id = ?', [id])
    if (!cats.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ category: cats[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export const PUT = withAuth(async function(request, { params }) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let data = {}

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const imageFile = formData.get('image')
      
      if (imageFile && imageFile.size > 0) {
        const old = await query('SELECT image_url FROM product_categories WHERE id = ?', [params.id])
        if (old.length && old[0].image_url) deleteFile(old[0].image_url)
        const uploaded = await saveUploadedFile(imageFile, 'categories')
        data.image_url = uploaded.fileUrl
      }
      
      ;['name', 'slug', 'description', 'parent_id', 'sort_order', 'is_active'].forEach(f => {
        const val = formData.get(f)
        if (val !== null) data[f] = val
      })
    } else {
      data = await request.json()
    }
    
    const setClauses = Object.keys(data).map(k => `${k} = ?`)
    const values = [...Object.values(data), params.id]
    
    await query(`UPDATE product_categories SET ${setClauses.join(', ')} WHERE id = ?`, values)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
})

export const DELETE = withAuth(async function(request, { params }) {
  try {
    // Check if category has products
    const products = await query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [params.id])
    if (products[0].count > 0) {
      return NextResponse.json({ error: 'Cannot delete category with products. Move products first.' }, { status: 409 })
    }
    
    const cats = await query('SELECT image_url FROM product_categories WHERE id = ?', [params.id])
    if (cats.length && cats[0].image_url) deleteFile(cats[0].image_url)
    
    await query('DELETE FROM product_categories WHERE id = ?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
})
