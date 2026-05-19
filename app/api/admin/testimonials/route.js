import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { saveUploadedFile } from '@/lib/upload'

export async function GET() {
  try {
    const testimonials = await query(
      'SELECT * FROM testimonials WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC'
    )
    return NextResponse.json({ testimonials })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

export const POST = withAuth(async function(request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let data = {}
    let avatarUrl = null
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const imageFile = formData.get('avatar')
      if (imageFile && imageFile.size > 0) {
        const uploaded = await saveUploadedFile(imageFile, 'testimonials')
        avatarUrl = uploaded.fileUrl
      }
      ;['name', 'position', 'company', 'content', 'rating', 'avatar_initial', 'avatar_bg_color', 'source', 'is_featured', 'sort_order'].forEach(f => {
        const val = formData.get(f)
        if (val !== null) data[f] = val
      })
    } else {
      data = await request.json()
    }
    
    const result = await query(
      `INSERT INTO testimonials (name, position, company, content, rating, avatar_url, avatar_initial, avatar_bg_color, source, is_featured, sort_order)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [data.name, data.position || null, data.company || null, data.content, data.rating || 5,
       avatarUrl, data.avatar_initial || data.name?.[0]?.toUpperCase(), data.avatar_bg_color || '#0056B3',
       data.source || 'Google', data.is_featured === '1' ? 1 : 0, data.sort_order || 0]
    )
    
    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
})
