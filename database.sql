-- ============================================================
-- KRD Clean and Care - Complete MySQL Database Schema
-- Compatible with Hostinger MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS krd_clean_care CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE krd_clean_care;

-- ===================== USERS / ADMINS =====================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('superadmin', 'admin') DEFAULT 'admin',
  is_active TINYINT(1) DEFAULT 1,
  avatar VARCHAR(500) DEFAULT NULL,
  last_login DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===================== SITE SETTINGS =====================
CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_group VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===================== CONTENT SECTIONS =====================
-- Each page section (hero, about, etc.) can have multiple slides/blocks
CREATE TABLE IF NOT EXISTS content_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page VARCHAR(100) NOT NULL,           -- 'home', 'about', 'products', 'blog', 'faq', 'contact', 'footer'
  section VARCHAR(100) NOT NULL,        -- 'hero', 'about_intro', 'banner', etc.
  title TEXT DEFAULT NULL,
  subtitle TEXT DEFAULT NULL,
  mini_title TEXT DEFAULT NULL,
  paragraph TEXT DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,  -- path to uploaded image
  external_url VARCHAR(500) DEFAULT NULL,
  button_text VARCHAR(255) DEFAULT NULL,
  button_url VARCHAR(500) DEFAULT NULL,
  -- Rich text / styling fields
  title_color VARCHAR(50) DEFAULT '#111827',
  title_font VARCHAR(100) DEFAULT 'Lato',
  title_size VARCHAR(50) DEFAULT '4xl',
  title_weight VARCHAR(50) DEFAULT 'bold',
  subtitle_color VARCHAR(50) DEFAULT '#374151',
  subtitle_font VARCHAR(100) DEFAULT 'Poppins',
  paragraph_color VARCHAR(50) DEFAULT '#6B7280',
  -- Layout fields
  image_position VARCHAR(50) DEFAULT 'right',   -- left, right, top, bottom, background
  content_align VARCHAR(50) DEFAULT 'left',      -- left, center, right
  bg_color VARCHAR(50) DEFAULT '#FFFFFF',
  -- Meta
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_page_section (page, section),
  INDEX idx_sort (sort_order)
);

-- ===================== PRODUCT CATEGORIES =====================
CREATE TABLE IF NOT EXISTS product_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  parent_id INT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_parent (parent_id)
);

-- ===================== PRODUCTS =====================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT DEFAULT NULL,
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  short_description TEXT DEFAULT NULL,
  description LONGTEXT DEFAULT NULL,
  price DECIMAL(10,2) DEFAULT NULL,
  old_price DECIMAL(10,2) DEFAULT NULL,
  sku VARCHAR(100) DEFAULT NULL,
  stock_quantity INT DEFAULT 0,
  -- Images stored as JSON array of paths
  images JSON DEFAULT NULL,
  featured_image VARCHAR(500) DEFAULT NULL,
  -- Specs
  weight VARCHAR(100) DEFAULT NULL,
  volume VARCHAR(100) DEFAULT NULL,
  -- Flags
  is_featured TINYINT(1) DEFAULT 0,
  is_new TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  -- SEO
  meta_title VARCHAR(255) DEFAULT NULL,
  meta_description TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_category (category_id),
  INDEX idx_featured (is_featured)
);

-- ===================== BLOG CATEGORIES =====================
CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================== BLOG POSTS =====================
CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT DEFAULT NULL,
  author_id INT DEFAULT NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  excerpt TEXT DEFAULT NULL,
  content LONGTEXT DEFAULT NULL,
  featured_image VARCHAR(500) DEFAULT NULL,
  tags JSON DEFAULT NULL,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  is_featured TINYINT(1) DEFAULT 0,
  views INT DEFAULT 0,
  -- SEO
  meta_title VARCHAR(255) DEFAULT NULL,
  meta_description TEXT DEFAULT NULL,
  published_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_status (status)
);

-- ===================== FAQ =====================
CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer LONGTEXT NOT NULL,
  category VARCHAR(255) DEFAULT 'General',
  page VARCHAR(100) DEFAULT 'faq',     -- 'faq', 'home'
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===================== TESTIMONIALS =====================
CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) DEFAULT NULL,
  company VARCHAR(255) DEFAULT NULL,
  content TEXT NOT NULL,
  rating INT DEFAULT 5,
  avatar_url VARCHAR(500) DEFAULT NULL,
  avatar_initial VARCHAR(5) DEFAULT NULL,
  avatar_bg_color VARCHAR(50) DEFAULT '#0056B3',
  source VARCHAR(100) DEFAULT 'Google',
  is_featured TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================== ENQUIRIES / CONTACTS =====================
CREATE TABLE IF NOT EXISTS enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('contact', 'quote', 'faq') DEFAULT 'contact',
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  subject VARCHAR(500) DEFAULT NULL,
  message TEXT NOT NULL,
  product_interest VARCHAR(500) DEFAULT NULL,
  status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
  ip_address VARCHAR(50) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_email (email)
);

-- ===================== STATS / IMPACT SECTION =====================
CREATE TABLE IF NOT EXISTS stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  value VARCHAR(100) NOT NULL,
  icon VARCHAR(100) DEFAULT NULL,
  bg_color VARCHAR(50) DEFAULT '#e1f3d0',
  icon_color VARCHAR(50) DEFAULT '#0056B3',
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================== NAVIGATION MENU =====================
CREATE TABLE IF NOT EXISTS nav_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(255) NOT NULL,
  href VARCHAR(500) NOT NULL,
  parent_id INT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  open_in_new_tab TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES nav_items(id) ON DELETE SET NULL
);

-- ===================== FOOTER SECTIONS =====================
CREATE TABLE IF NOT EXISTS footer_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_type ENUM('about', 'links', 'contact', 'social', 'copyright') NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  content TEXT DEFAULT NULL,
  link_label VARCHAR(255) DEFAULT NULL,
  link_url VARCHAR(500) DEFAULT NULL,
  icon VARCHAR(100) DEFAULT NULL,
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================== MEDIA LIBRARY =====================
CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(500) NOT NULL,
  original_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) DEFAULT NULL,
  file_size INT DEFAULT 0,
  alt_text VARCHAR(500) DEFAULT NULL,
  uploaded_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_file_type (file_type)
);

-- ===================== AUDIT LOGS =====================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  action VARCHAR(255) NOT NULL,
  table_name VARCHAR(100) DEFAULT NULL,
  record_id INT DEFAULT NULL,
  old_values JSON DEFAULT NULL,
  new_values JSON DEFAULT NULL,
  ip_address VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ===================== DEFAULT DATA =====================

-- Insert default superadmin (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES 
('Super Admin', 'superadmin@krdcleancare.com', '$2a$12$1KfZAYGY1pKJo6hpyDNrV.BjBvqTmFqSOnZPTZoAZHjkNRuZQMdae', 'superadmin'),
('Admin User', 'admin@krdcleancare.com', '$2a$12$1KfZAYGY1pKJo6hpyDNrV.BjBvqTmFqSOnZPTZoAZHjkNRuZQMdae', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_group) VALUES 
('site_name', 'KRD Clean And Care', 'general'),
('site_tagline', 'India\'s B2B Cleaning Products Supplier', 'general'),
('site_email', 'info@krdcleanandcare.com', 'general'),
('site_phone', '08048966524', 'general'),
('site_address', 'Industrial Area Amaseoni, Khasra No. 232/1 Part, Raipur, Chhattisgarh, 492001, India', 'general'),
('site_logo', '/navbar/logo.png', 'general'),
('facebook_url', '#', 'social'),
('twitter_url', '#', 'social'),
('instagram_url', '#', 'social'),
('youtube_url', '#', 'social'),
('google_maps_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.544837549117!2d81.7061793!3d21.2498704!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28dd0409f0f9c5%3A0x633b497f6c348555!2sAmaseoni%2C%20Raipur%2C%20Chhattisgarh!5e0!3m2!1sen!2sin!4v1715510000000!5m2!1sen!2sin', 'contact'),
('working_hours', 'Monday - Saturday: 10:00 AM - 07:00 PM', 'contact')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

-- Insert default product categories
INSERT INTO product_categories (name, slug, description, sort_order) VALUES 
('Glass & Surface Cleaners', 'glass-surface-cleaners', 'Premium glass and multi-surface cleaning solutions', 1),
('Floor Cleaners', 'floor-cleaners', 'Milky herbal and perfumed floor cleaning products', 2),
('Toilet Care', 'toilet-care', 'Powerful toilet cleaning and hygiene products', 3),
('Milky Perfumed Cleaners', 'milky-perfumed-cleaners', 'Fragrant cleaning solutions for a fresh home', 4),
('Dish Wash Gel', 'dish-wash-gel', 'Effective dishwashing gels and liquids', 5)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert default FAQs
INSERT INTO faqs (question, answer, category, page, sort_order) VALUES 
('Are your cleaning products herbal?', 'Yes, we offer a range of herbal-based products, including our popular Neem and Lemon Grass cleaners.', 'Products', 'both', 1),
('Where is your manufacturing unit located?', 'We operate from the Mandhar and Amaseoni Industrial Areas in Raipur, Chhattisgarh.', 'Company', 'both', 2),
('Do you offer bulk B2B pricing?', 'Absolutely. As a registered Private Limited manufacturer, we specialize in high-volume supply for retail and industrial sectors.', 'Pricing', 'both', 3),
('What certifications do your products have?', 'Our Vis Clean brand products meet all Indian regulatory standards and are tested for safety and efficacy.', 'Products', 'faq', 4),
('How long does delivery take?', 'We offer timely shipping from our Amaseoni and Mandhar industrial units, typically within 3-7 business days.', 'Delivery', 'faq', 5)
ON DUPLICATE KEY UPDATE question=VALUES(question);

-- Insert default stats
INSERT INTO stats (label, value, icon, bg_color, icon_color, sort_order) VALUES 
('Clean litres sold', '342,751+', 'water', '#e1f3d0', '#16a34a', 1),
('Products sold', '10,731+', 'package', '#f5e6d3', '#ea580c', 2),
('Refills sold', '275,487+', 'refresh', '#f3e1ff', '#9333ea', 3),
('KRD families :)', '865,447+', 'users', '#ffe1e9', '#db2777', 4)
ON DUPLICATE KEY UPDATE label=VALUES(label);

-- Insert default testimonials
INSERT INTO testimonials (name, content, rating, avatar_initial, avatar_bg_color, source, sort_order) VALUES 
('Nikita Pawar', 'Services all time it\'s good', 5, 'N', '#64748b', 'Google', 1),
('Shailesh Kamble', 'Excellent service across pan India. Very professional, Reliable, and always delivers quality work....', 5, 'S', '#7e22ce', 'Google', 2),
('Savaliya Jaydeep', 'Good category', 5, 'S', '#ea580c', 'Google', 3),
('Babu Butani', 'Very Good', 5, 'B', '#0056B3', 'Google', 4)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert default home page content sections
INSERT INTO content_sections (page, section, title, subtitle, mini_title, paragraph, sort_order) VALUES
('home', 'hero', 'India\'s B2B Cleaning Products Supplier', NULL, 'KRD Housekeeping Products Clean Meets Convenience', 'Premium manufacturing of eco-friendly hygiene solutions for industrial, commercial, and domestic use. Delivering excellence through our signature Vis Clean brand.', 1),
('home', 'about', 'Housekeeping Products Clean Without Compromise', NULL, 'Who We Are', 'Established in 2021, KRD Clean and Care Private Limited combines modern chemical engineering with eco-friendly ingredients.', 1),
('home', 'banner', 'Power Up Your Clean Home!', NULL, 'KRD Clean And Care', NULL, 1),
('about', 'hero', 'Reliable, Affordable & Eco-Friendly Hygiene Solutions', NULL, 'Our Story', 'Founded in 2021, KRD Clean and Care Pvt Ltd is committed to providing premium cleaning solutions with a focus on quality and sustainability.', 1),
('products', 'hero', 'Our Products', NULL, 'Vis Clean Range', 'Browse our complete catalog of premium cleaning products.', 1),
('blog', 'hero', 'Our Blog', NULL, 'Latest Updates', 'Stay updated with the latest news and insights from KRD Clean and Care.', 1),
('faq', 'hero', 'Frequently Asked Questions', NULL, 'Got Questions?', 'Find quick solutions to common queries about our products and services.', 1),
('contact', 'hero', 'Contact Us', NULL, 'Get In Touch', 'We\'d love to hear from you. Send us a message and we\'ll get back to you.', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Insert default nav items
INSERT INTO nav_items (label, href, sort_order) VALUES
('Home', '/', 1),
('About Us', '/about', 2),
('Products', '/products', 3),
('Blog', '/blog', 4),
('FAQ', '/faq', 5),
('Contact Us', '/contact', 6)
ON DUPLICATE KEY UPDATE label=VALUES(label);
