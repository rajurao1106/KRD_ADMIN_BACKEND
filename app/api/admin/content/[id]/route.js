import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { saveUploadedFile, deleteFile } from '@/lib/upload'

export async function GET(request, context) {
  try {
    const { id } = await context.params
    const sections = await query('SELECT * FROM content_sections WHERE id = ?', [id])
    if (!sections.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ section: sections[0] })
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
      
      // ✅ Guard with instanceof check
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        const old = await query('SELECT image_url FROM content_sections WHERE id = ?', [params.id])
        if (old.length && old[0].image_url) deleteFile(old[0].image_url)
        
        const uploaded = await saveUploadedFile(imageFile, 'sections')
        data.image_url = uploaded.fileUrl
      }
      
      const fields = ['page', 'section', 'title', 'subtitle', 'mini_title', 'paragraph',
        'external_url', 'button_text', 'button_url', 'title_color', 'title_font',
        'title_size', 'title_weight', 'subtitle_color', 'subtitle_font', 'paragraph_color',
        'image_position', 'content_align', 'bg_color', 'sort_order', 'is_active']
      
      fields.forEach(f => {
        const val = formData.get(f)
        if (val !== null && val !== 'undefined' && val !== 'null') {
          // ✅ Coerce boolean-like fields to integers
          if (f === 'is_active') {
            data[f] = val === 'true' || val === '1' ? 1 : 0
          } else {
            data[f] = val
          }
        }
      })

      const imageUrlField = formData.get('image_url')
      if (imageUrlField && imageUrlField !== 'undefined' && imageUrlField !== 'null' && !data.image_url) {
        data.image_url = imageUrlField
      }
    } else {
      data = await request.json()
    }

    const setClauses = []
    const values = []
    
    const allowedFields = ['page', 'section', 'title', 'subtitle', 'mini_title', 'paragraph',
      'image_url', 'external_url', 'button_text', 'button_url', 'title_color', 'title_font',
      'title_size', 'title_weight', 'subtitle_color', 'subtitle_font', 'paragraph_color',
      'image_position', 'content_align', 'bg_color', 'sort_order', 'is_active']
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== 'undefined') {
        setClauses.push(`${field} = ?`)
        values.push(data[field])
      }
    })
    
    if (!setClauses.length) return NextResponse.json({ error: 'No data to update' }, { status: 400 })
    
    values.push(params.id)
    await query(`UPDATE content_sections SET ${setClauses.join(', ')} WHERE id = ?`, values)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Content update error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 })
  }
})

export const DELETE = withAuth(async function(request, { params }) {
  try {
    const sections = await query('SELECT image_url FROM content_sections WHERE id = ?', [params.id])
    if (sections.length && sections[0].image_url) deleteFile(sections[0].image_url)
    
    await query('DELETE FROM content_sections WHERE id = ?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
})
