import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'
import { saveUploadedFile } from '@/lib/upload'

export const POST = withAuth(async function(request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files')
    const subDir = formData.get('folder') || 'general'
    
    const uploaded = []
    
    for (const file of files) {
      if (file && file.size > 0) {
        const result = await saveUploadedFile(file, subDir)
        
        await query(
          `INSERT INTO media (filename, original_name, file_path, file_url, file_type, file_size, alt_text, uploaded_by)
           VALUES (?,?,?,?,?,?,?,?)`,
          [result.filename, result.originalName, result.filepath, result.fileUrl,
           result.fileType, result.fileSize, formData.get('alt_text') || file.name.split('.')[0],
           request.user?.id || null]
        )
        
        uploaded.push(result)
      }
    }
    
    return NextResponse.json({ success: true, files: uploaded })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
})

export const GET = withAuth(async function(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    
    const media = await query(
      `SELECT * FROM media ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    )
    const [{ total }] = await query('SELECT COUNT(*) as total FROM media')
    
    return NextResponse.json({ media, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
})
