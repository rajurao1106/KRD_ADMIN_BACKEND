import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { deleteFile } from '@/lib/upload'

export const DELETE = withAuth(async function(request, { params }) {
  try {
    const media = await query('SELECT file_url FROM media WHERE id = ?', [params.id])
    if (media.length && media[0].file_url) {
      deleteFile(media[0].file_url)
    }
    await query('DELETE FROM media WHERE id = ?', [params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
})

export const PUT = withAuth(async function(request, { params }) {
  try {
    const data = await request.json()
    await query('UPDATE media SET alt_text = ? WHERE id = ?', [data.alt_text, params.id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
})
