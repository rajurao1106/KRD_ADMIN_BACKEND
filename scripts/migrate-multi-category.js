require('dotenv').config()
const mysql = require('mysql2/promise')

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  })

  console.log('Connected to database...')

  // Create junction table
 await connection.execute(`
  CREATE TABLE IF NOT EXISTS product_category_map (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    category_id INT NOT NULL,
    UNIQUE KEY unique_pc (product_id, category_id),
    INDEX idx_product (product_id),
    INDEX idx_category (category_id)
  )
`)
  console.log('✓ product_category_map table created')

  // Migrate existing category_id data
  const [products] = await connection.execute('SELECT id, category_id FROM products WHERE category_id IS NOT NULL')
  for (const p of products) {
    await connection.execute(
      'INSERT IGNORE INTO product_category_map (product_id, category_id) VALUES (?, ?)',
      [p.id, p.category_id]
    )
  }
  console.log(`✓ Migrated ${products.length} existing product-category relationships`)

  await connection.end()
  console.log('Done!')
}

migrate().catch(err => { console.error(err); process.exit(1) })
