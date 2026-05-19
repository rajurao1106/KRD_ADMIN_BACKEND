import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const group = searchParams.get('group')
    
    let sql = 'SELECT * FROM site_settings'
    const params = []
    if (group) { sql += ' WHERE setting_group = ?'; params.push(group) }
    sql += ' ORDER BY setting_group, setting_key'
    
    const settings = await query(sql, params)
    
    // Convert to key-value object
    const settingsObj = {}
    settings.forEach(s => { settingsObj[s.setting_key] = s.setting_value })
    
    return NextResponse.json({ settings: settingsObj, raw: settings })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export const PUT = withAuth(async function(request) {
  try {
    const data = await request.json()
    
    // Bulk update settings
    for (const [key, value] of Object.entries(data)) {
      await query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, value, value]
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
})
