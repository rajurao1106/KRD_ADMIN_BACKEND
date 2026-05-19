import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

export function ensureUploadDir(subDir = '') {
  const dir = subDir ? path.join(UPLOAD_DIR, subDir) : UPLOAD_DIR
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export async function saveUploadedFile(file, subDir = 'general') {
  const dir = ensureUploadDir(subDir)
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  const ext = path.extname(file.name).toLowerCase()
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  
  if (!allowedExts.includes(ext)) {
    throw new Error('Invalid file type. Only images are allowed.')
  }
  
  const filename = `${uuidv4()}${ext}`
  const filepath = path.join(dir, filename)
  const fileUrl = `/uploads/${subDir}/${filename}`
  
  fs.writeFileSync(filepath, buffer)
  
  return {
    filename,
    filepath,
    fileUrl,
    originalName: file.name,
    fileSize: buffer.length,
    fileType: file.type,
  }
}

export function deleteFile(fileUrl) {
  if (!fileUrl) return
  const filepath = path.join(process.cwd(), 'public', fileUrl)
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath)
  }
}
