import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

export const GET = withAuth(async function() {
  try {
    const [products] = await query('SELECT COUNT(*) as count FROM products WHERE is_active = 1')
    const [categories] = await query('SELECT COUNT(*) as count FROM product_categories WHERE is_active = 1')
    const [blogs] = await query("SELECT COUNT(*) as count FROM blog_posts WHERE status = 'published'")
    const [enquiries] = await query("SELECT COUNT(*) as count FROM enquiries WHERE status = 'new'")
    const [totalEnquiries] = await query('SELECT COUNT(*) as count FROM enquiries')
    const [faqs] = await query('SELECT COUNT(*) as count FROM faqs WHERE is_active = 1')
    const [users] = await query('SELECT COUNT(*) as count FROM users WHERE is_active = 1')
    
    const recentEnquiries = await query(
      'SELECT id, first_name, last_name, email, type, status, created_at FROM enquiries ORDER BY created_at DESC LIMIT 5'
    )
    
    return NextResponse.json({
      stats: {
        products: products.count,
        categories: categories.count,
        blogs: blogs.count,
        newEnquiries: enquiries.count,
        totalEnquiries: totalEnquiries.count,
        faqs: faqs.count,
        users: users.count,
      },
      recentEnquiries,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
})
