import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { saveUploadedFile, deleteFile } from '@/lib/upload'

export async function GET(request, context) {
  try {
    const { id } = await context.params
    const posts = await query(
      `SELECT bp.*, bc.name as category_name, u.name as author_name
       FROM blog_posts bp
       LEFT JOIN blog_categories bc ON bp.category_id = bc.id
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.id = ? OR bp.slug = ?`,
      [id, id]
    )
    if (!posts.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
    // Increment views
    await query('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [posts[0].id])
    
    return NextResponse.json({ post: posts[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export const PUT = withAuth(async function(request, { params }) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let data = {}
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const imageFile = formData.get('featured_image')
      
      if (imageFile && imageFile.size > 0) {
        const old = await query('SELECT featured_image FROM blog_posts WHERE id = ?', [params.id])
        if (old.length && old[0].featured_image) deleteFile(old[0].featured_image)
        const uploaded = await saveUploadedFile(imageFile, 'blog')
        data.featured_image = uploaded.fileUrl
      }
      
      ;['category_id', 'title', 'slug', 'excerpt', 'content', 'tags', 'status', 'is_featured', 'meta_title', 'meta_description'].forEach(f => {
        const val = formData.get(f)
        if (val !== null) data[f] = val
      })
    } else {
      data = await request.json()
    }
    
    // Handle published_at
    if (data.status === 'published') {
      const current = await query('SELECT published_at FROM blog_posts WHERE id = ?', [params.id])
      if (current.length && !current[0].published_at) {
        data.published_at = new Date()
      }
    }
    
    const setClauses = Object.keys(data).map(k => `${k} = ?`)
    const values = [...Object.values(data), params.id]
    
    await query(`UPDATE blog_posts SET ${setClauses.join(', ')} WHERE id = ?`, values)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
})

export const DELETE = withAuth(async function(request, { params }) {
  try {
    const posts = await query('SELECT featured_image FROM blog_posts WHERE id = ?', [params.id])
    if (posts.length && posts[0].featured_image) deleteFile(posts[0].featured_image)
    await query('DELETE FROM blog_posts WHERE id = ?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
})
