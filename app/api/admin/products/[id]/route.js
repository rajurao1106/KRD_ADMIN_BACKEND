import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { saveUploadedFile, deleteFile } from '@/lib/upload'

export async function GET(request, context) {
  try {
    const { id } = await context.params
    const products = await query(
      `SELECT p.*, pc.name as category_name FROM products p
       LEFT JOIN product_categories pc ON p.category_id = pc.id
       WHERE p.id = ?`,
      [id]
    )
    if (!products.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ product: products[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export const PUT = withAuth(async function(request, { params }) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let data = {}
    let newImageUrls = null
    let categoryIds = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const imageFiles = formData.getAll('images')

      if (imageFiles.some(f => f && f.size > 0)) {
        const old = await query('SELECT images, featured_image FROM products WHERE id = ?', [params.id])
        if (old.length) {
          try {
            const oldImages = JSON.parse(old[0].images || '[]')
            if (Array.isArray(oldImages)) oldImages.forEach(img => deleteFile(img))
          } catch { /* ignore bad JSON */ }
        }

        newImageUrls = []
        for (const file of imageFiles) {
          if (file && file.size > 0) {
            const uploaded = await saveUploadedFile(file, 'products')
            newImageUrls.push(uploaded.fileUrl)
          }
        }
      }

      const categoryIdsRaw = formData.get('category_ids') || ''
      if (categoryIdsRaw) {
        try { categoryIds = JSON.parse(categoryIdsRaw) } catch { categoryIds = categoryIdsRaw.split(',').filter(Boolean) }
      }

      const fields = ['category_id', 'name', 'slug', 'short_description', 'description',
        'price', 'old_price', 'sku', 'stock_quantity', 'weight', 'volume',
        'is_featured', 'is_new', 'is_active', 'sort_order', 'meta_title', 'meta_description']

      fields.forEach(f => {
        const val = formData.get(f)
        if (val !== null && val !== 'undefined') data[f] = val
      })
    } else {
      const body = await request.json()
      if (body.category_ids) {
        categoryIds = body.category_ids
        delete body.category_ids
      }
      data = body
    }

    if (newImageUrls) {
      data.images = JSON.stringify(newImageUrls)
      data.featured_image = newImageUrls[0] || null
    }

    if (categoryIds && categoryIds.length > 0) {
      data.category_id = categoryIds[0]
    }

    const setClauses = []
    const values = []

    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== 'undefined') {
        setClauses.push(`${key} = ?`)
        values.push(val)
      }
    })

    if (setClauses.length) {
      values.push(params.id)
      await query(`UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`, values)
    }

    try {
      if (categoryIds !== null) {
        await query('DELETE FROM product_category_map WHERE product_id = ?', [params.id])
        for (const catId of categoryIds) {
          if (catId) {
            await query(
              'INSERT IGNORE INTO product_category_map (product_id, category_id) VALUES (?, ?)',
              [params.id, catId]
            )
          }
        }
      }
    } catch (catErr) {
      console.warn('product_category_map update skipped:', catErr.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json({ error: 'Failed to update product', detail: error.message }, { status: 500 })
  }
})

export const DELETE = withAuth(async function(request, { params }) {
  try {
    const products = await query('SELECT images FROM products WHERE id = ?', [params.id])
    if (products.length) {
      try {
        const images = JSON.parse(products[0].images || '[]')
        if (Array.isArray(images)) images.forEach(img => deleteFile(img))
      } catch { /* ignore bad JSON */ }
    }

    try {
      await query('DELETE FROM product_category_map WHERE product_id = ?', [params.id])
    } catch (catErr) {
      console.warn('product_category_map delete skipped:', catErr.message)
    }

    await query('DELETE FROM products WHERE id = ?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json({ error: 'Failed to delete product', detail: error.message }, { status: 500 })
  }
})