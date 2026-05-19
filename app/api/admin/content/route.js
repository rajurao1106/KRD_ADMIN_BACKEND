import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { saveUploadedFile } from '@/lib/upload'

// GET - fetch content sections
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const section = searchParams.get('section')
    const activeOnly = searchParams.get('active') !== 'false'
    
    let sql = 'SELECT * FROM content_sections WHERE 1=1'
    const params = []
    
    if (page) { sql += ' AND page = ?'; params.push(page) }
    if (section) { sql += ' AND section = ?'; params.push(section) }
    if (activeOnly) { sql += ' AND is_active = 1' }
    
    sql += ' ORDER BY page, section, sort_order ASC'
    
    const sections = await query(sql, params)
    return NextResponse.json({ sections })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
  }
}

// POST - create new section
export const POST = withAuth(async function(request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let data = {}
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const imageFile = formData.get('image')
      
      if (imageFile && imageFile.size > 0) {
        const uploaded = await saveUploadedFile(imageFile, 'sections')
        data.image_url = uploaded.fileUrl
      }
      
      const fields = ['page', 'section', 'title', 'subtitle', 'mini_title', 'paragraph', 
        'external_url', 'button_text', 'button_url', 'title_color', 'title_font', 
        'title_size', 'title_weight', 'subtitle_color', 'subtitle_font', 'paragraph_color',
        'image_position', 'content_align', 'bg_color', 'sort_order', 'is_active']
      
      fields.forEach(f => {
        const val = formData.get(f)
        if (val !== null) data[f] = val
      })
    } else {
      data = await request.json()
    }
    
    if (!data.page || !data.section) {
      return NextResponse.json({ error: 'page and section are required' }, { status: 400 })
    }
    
    const result = await query(
      `INSERT INTO content_sections 
       (page, section, title, subtitle, mini_title, paragraph, image_url, external_url, 
        button_text, button_url, title_color, title_font, title_size, title_weight,
        subtitle_color, subtitle_font, paragraph_color, image_position, content_align, 
        bg_color, sort_order, is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        data.page, data.section, data.title || null, data.subtitle || null,
        data.mini_title || null, data.paragraph || null, data.image_url || null,
        data.external_url || null, data.button_text || null, data.button_url || null,
        data.title_color || '#111827', data.title_font || 'Lato', data.title_size || '4xl',
        data.title_weight || 'bold', data.subtitle_color || '#374151',
        data.subtitle_font || 'Poppins', data.paragraph_color || '#6B7280',
        data.image_position || 'right', data.content_align || 'left',
        data.bg_color || '#FFFFFF', data.sort_order || 0, data.is_active !== false ? 1 : 0
      ]
    )
    
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
})
