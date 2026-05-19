import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { saveUploadedFile, deleteFile } from '@/lib/upload'

export const PUT = withAuth(async function(request, { params }) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let data = {}

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const imageFile = formData.get('avatar')
      if (imageFile && imageFile.size > 0) {
        const old = await query('SELECT avatar_url FROM testimonials WHERE id = ?', [params.id])
        if (old.length && old[0].avatar_url) deleteFile(old[0].avatar_url)
        const uploaded = await saveUploadedFile(imageFile, 'testimonials')
        data.avatar_url = uploaded.fileUrl
      }
      ;['name', 'position', 'company', 'content', 'rating', 'avatar_initial', 'avatar_bg_color', 'source', 'is_featured', 'sort_order', 'is_active'].forEach(f => {
        const val = formData.get(f)
        if (val !== null) data[f] = val
      })
    } else {
      data = await request.json()
    }

    const setClauses = Object.keys(data).map(k => `${k} = ?`)
    const values = [...Object.values(data), params.id]
    await query(`UPDATE testimonials SET ${setClauses.join(', ')} WHERE id = ?`, values)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
})

export const DELETE = withAuth(async function(request, { params }) {
  try {
    const items = await query('SELECT avatar_url FROM testimonials WHERE id = ?', [params.id])
    if (items.length && items[0].avatar_url) deleteFile(items[0].avatar_url)
    await query('DELETE FROM testimonials WHERE id = ?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
})
