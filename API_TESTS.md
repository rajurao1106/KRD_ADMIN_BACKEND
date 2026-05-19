# KRD Admin Backend - API Test Collection

## Base URL
```
Local: http://localhost:3000
Render: https://krd-adminbackend.onrender.com (your deployed URL)
```

---

## 🔐 AUTH APIs

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@krdcleancare.com","password":"Admin@123"}' \
  -c cookies.txt
```

### 2. Get Current User (requires auth cookie)
```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### 3. Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## 📊 DASHBOARD

### 4. Get Dashboard Stats
```bash
curl http://localhost:3000/api/admin/dashboard \
  -b cookies.txt
```

---

## 📦 PRODUCTS

### 5. Get All Products (with filters)
```bash
# All products
curl "http://localhost:3000/api/admin/products?page=1&limit=12&active=false" \
  -b cookies.txt

# Search
curl "http://localhost:3000/api/admin/products?search=cleaner&page=1&limit=12" \
  -b cookies.txt

# Filter by category
curl "http://localhost:3000/api/admin/products?category_id=1&page=1&limit=12" \
  -b cookies.txt

# Featured only
curl "http://localhost:3000/api/admin/products?featured=1" \
  -b cookies.txt
```

### 6. Create Product
```bash
curl -X POST http://localhost:3000/api/admin/products \
  -b cookies.txt \
  -F "name=Floor Cleaner Premium" \
  -F "slug=floor-cleaner-premium" \
  -F "category_id=1" \
  -F "short_description=Best floor cleaner" \
  -F "description=Premium quality floor cleaner for all surfaces" \
  -F "price=299" \
  -F "old_price=399" \
  -F "sku=KRD-FC-001" \
  -F "weight=1kg" \
  -F "volume=1000ml" \
  -F "is_featured=1" \
  -F "is_new=1" \
  -F "is_active=1" \
  -F "sort_order=1"
```

### 7. Update Product
```bash
curl -X PUT http://localhost:3000/api/admin/products/1 \
  -b cookies.txt \
  -F "name=Floor Cleaner Premium Updated" \
  -F "price=349" \
  -F "is_featured=1"
```

### 8. Delete Product
```bash
curl -X DELETE http://localhost:3000/api/admin/products/1 \
  -b cookies.txt
```

---

## 🏷️ CATEGORIES

### 9. Get All Categories
```bash
curl http://localhost:3000/api/admin/categories \
  -b cookies.txt
```

### 10. Create Category
```bash
curl -X POST http://localhost:3000/api/admin/categories \
  -b cookies.txt \
  -F "name=Floor Cleaners" \
  -F "slug=floor-cleaners" \
  -F "description=All types of floor cleaning products" \
  -F "sort_order=1" \
  -F "is_active=1"
```

### 11. Update Category
```bash
curl -X PUT http://localhost:3000/api/admin/categories/1 \
  -b cookies.txt \
  -F "name=Floor Cleaners Updated" \
  -F "sort_order=2"
```

### 12. Delete Category
```bash
curl -X DELETE http://localhost:3000/api/admin/categories/1 \
  -b cookies.txt
```

---

## 📝 BLOG POSTS

### 13. Get All Blog Posts
```bash
# All posts
curl "http://localhost:3000/api/admin/blog?page=1&limit=10&status=all" \
  -b cookies.txt

# Published only
curl "http://localhost:3000/api/admin/blog?status=published" \
  -b cookies.txt

# Drafts
curl "http://localhost:3000/api/admin/blog?status=draft" \
  -b cookies.txt
```

### 14. Create Blog Post
```bash
curl -X POST http://localhost:3000/api/admin/blog \
  -b cookies.txt \
  -F "title=How to Clean Floors Effectively" \
  -F "slug=how-to-clean-floors" \
  -F "excerpt=Learn the best techniques for floor cleaning" \
  -F "content=Full blog content goes here..." \
  -F "status=published" \
  -F "is_featured=0" \
  -F "meta_title=Floor Cleaning Tips" \
  -F "meta_description=Best floor cleaning techniques"
```

### 15. Update Blog Post
```bash
curl -X PUT http://localhost:3000/api/admin/blog/1 \
  -b cookies.txt \
  -F "title=Updated Blog Title" \
  -F "status=published"
```

### 16. Delete Blog Post
```bash
curl -X DELETE http://localhost:3000/api/admin/blog/1 \
  -b cookies.txt
```

### 17. Get Blog Categories
```bash
curl http://localhost:3000/api/admin/blog-categories \
  -b cookies.txt
```

---

## ❓ FAQs

### 18. Get All FAQs
```bash
curl "http://localhost:3000/api/admin/faqs?active=false" \
  -b cookies.txt
```

### 19. Create FAQ
```bash
curl -X POST http://localhost:3000/api/admin/faqs \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What products do you offer?",
    "answer": "We offer a wide range of cleaning products including floor cleaners, toilet cleaners, and more.",
    "category": "Products",
    "page": "both",
    "sort_order": 1,
    "is_active": 1
  }'
```

### 20. Update FAQ
```bash
curl -X PUT http://localhost:3000/api/admin/faqs/1 \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Updated question?",
    "answer": "Updated answer.",
    "is_active": 1
  }'
```

### 21. Delete FAQ
```bash
curl -X DELETE http://localhost:3000/api/admin/faqs/1 \
  -b cookies.txt
```

---

## 💬 ENQUIRIES

### 22. Get All Enquiries
```bash
# All
curl "http://localhost:3000/api/admin/enquiries?page=1&limit=15" \
  -b cookies.txt

# Filter by status
curl "http://localhost:3000/api/admin/enquiries?status=new" \
  -b cookies.txt

# Filter by type
curl "http://localhost:3000/api/admin/enquiries?type=quote" \
  -b cookies.txt
```

### 23. Get Single Enquiry
```bash
curl http://localhost:3000/api/admin/enquiries/1 \
  -b cookies.txt
```

### 24. Update Enquiry Status
```bash
curl -X PUT http://localhost:3000/api/admin/enquiries/1 \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"status":"replied","notes":"Replied via email on 16 May"}'
```

### 25. Delete Enquiry
```bash
curl -X DELETE http://localhost:3000/api/admin/enquiries/1 \
  -b cookies.txt
```

---

## 👥 USERS (Superadmin only)

### 26. Get All Users
```bash
curl http://localhost:3000/api/admin/users \
  -b cookies.txt
```

### 27. Create User
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Admin",
    "email": "admin@krdcleancare.com",
    "password": "Admin@123",
    "role": "admin",
    "is_active": 1
  }'
```

### 28. Update User
```bash
curl -X PUT http://localhost:3000/api/admin/users/2 \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Admin","role":"admin","is_active":1}'
```

### 29. Delete User
```bash
curl -X DELETE http://localhost:3000/api/admin/users/2 \
  -b cookies.txt
```

---

## ⭐ TESTIMONIALS

### 30. Get All Testimonials
```bash
curl http://localhost:3000/api/admin/testimonials \
  -b cookies.txt
```

### 31. Create Testimonial
```bash
curl -X POST http://localhost:3000/api/admin/testimonials \
  -b cookies.txt \
  -F "name=Rajesh Kumar" \
  -F "position=Manager" \
  -F "company=ABC Industries" \
  -F "content=Excellent cleaning products! Very satisfied with the quality." \
  -F "rating=5" \
  -F "source=Google" \
  -F "avatar_initial=R" \
  -F "avatar_bg_color=#0056B3" \
  -F "is_featured=1" \
  -F "is_active=1" \
  -F "sort_order=1"
```

### 32. Update Testimonial
```bash
curl -X PUT http://localhost:3000/api/admin/testimonials/1 \
  -b cookies.txt \
  -F "name=Rajesh Kumar Updated" \
  -F "rating=5"
```

### 33. Delete Testimonial
```bash
curl -X DELETE http://localhost:3000/api/admin/testimonials/1 \
  -b cookies.txt
```

---

## 📊 STATS & IMPACT

### 34. Get All Stats
```bash
curl http://localhost:3000/api/admin/stats \
  -b cookies.txt
```

### 35. Create Stat
```bash
curl -X POST http://localhost:3000/api/admin/stats \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Happy Clients",
    "value": "500+",
    "bg_color": "#e1f3d0",
    "icon_color": "#16a34a",
    "sort_order": 1,
    "is_active": 1
  }'
```

### 36. Update Stat
```bash
curl -X PUT http://localhost:3000/api/admin/stats/1 \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"value":"750+","label":"Happy Clients"}'
```

### 37. Delete Stat
```bash
curl -X DELETE http://localhost:3000/api/admin/stats/1 \
  -b cookies.txt
```

---

## 📄 CONTENT SECTIONS

### 38. Get All Content Sections
```bash
curl "http://localhost:3000/api/admin/content?active=false" \
  -b cookies.txt
```

### 39. Create Content Section
```bash
curl -X POST http://localhost:3000/api/admin/content \
  -b cookies.txt \
  -F "page=home" \
  -F "section=hero" \
  -F "title=Welcome to KRD Clean And Care" \
  -F "subtitle=India's Leading B2B Cleaning Products" \
  -F "paragraph=Premium manufacturing of eco-friendly hygiene solutions" \
  -F "button_text=Explore Products" \
  -F "button_url=/products" \
  -F "title_color=#111827" \
  -F "title_font=Lato" \
  -F "title_size=4xl" \
  -F "title_weight=bold" \
  -F "sort_order=1" \
  -F "is_active=1"
```

### 40. Update Content Section
```bash
curl -X PUT http://localhost:3000/api/admin/content/1 \
  -b cookies.txt \
  -F "title=Updated Hero Title" \
  -F "is_active=1"
```

### 41. Delete Content Section
```bash
curl -X DELETE http://localhost:3000/api/admin/content/1 \
  -b cookies.txt
```

---

## 🖼️ MEDIA LIBRARY

### 42. Get All Media
```bash
curl "http://localhost:3000/api/admin/media?page=1&limit=24" \
  -b cookies.txt
```

### 43. Upload Media
```bash
curl -X POST http://localhost:3000/api/admin/media \
  -b cookies.txt \
  -F "files=@/path/to/image.jpg" \
  -F "folder=general"
```

### 44. Delete Media
```bash
curl -X DELETE http://localhost:3000/api/admin/media/1 \
  -b cookies.txt
```

---

## ⚙️ SETTINGS

### 45. Get Settings
```bash
curl http://localhost:3000/api/admin/settings \
  -b cookies.txt
```

### 46. Update Settings
```bash
curl -X PUT http://localhost:3000/api/admin/settings \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "site_name": "KRD Clean And Care",
    "site_tagline": "India'\''s B2B Cleaning Products Supplier",
    "site_email": "info@krdcleanandcare.com",
    "site_phone": "08048966524",
    "site_address": "Raipur, Chhattisgarh, India",
    "primary_color": "#0056B3",
    "facebook_url": "https://facebook.com/krdcleancare",
    "instagram_url": "https://instagram.com/krdcleancare"
  }'
```

---

## 🌐 PUBLIC APIs (No auth required)

### 47. Get Public Products
```bash
curl "http://localhost:3000/api/public/products"
curl "http://localhost:3000/api/public/products?category_id=1"
curl "http://localhost:3000/api/public/products?featured=1"
```

---

## 🧪 Quick Test Script (PowerShell)

```powershell
$base = "http://localhost:3000"

# Login and get cookie
$login = Invoke-WebRequest -Uri "$base/api/auth/login" -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"superadmin@krdcleancare.com","password":"Admin@123"}' `
  -SessionVariable session

Write-Host "Login: $($login.StatusCode)" -ForegroundColor Green

# Get current user
$me = Invoke-WebRequest -Uri "$base/api/auth/me" -WebSession $session
Write-Host "Me: $($me.StatusCode) - $($me.Content)" -ForegroundColor Green

# Dashboard
$dash = Invoke-WebRequest -Uri "$base/api/admin/dashboard" -WebSession $session
Write-Host "Dashboard: $($dash.StatusCode)" -ForegroundColor Green

# Products
$products = Invoke-WebRequest -Uri "$base/api/admin/products?page=1&limit=5&active=false" -WebSession $session
Write-Host "Products: $($products.StatusCode)" -ForegroundColor Green

# Categories
$cats = Invoke-WebRequest -Uri "$base/api/admin/categories" -WebSession $session
Write-Host "Categories: $($cats.StatusCode)" -ForegroundColor Green

# Blog
$blog = Invoke-WebRequest -Uri "$base/api/admin/blog?status=all" -WebSession $session
Write-Host "Blog: $($blog.StatusCode)" -ForegroundColor Green

# FAQs
$faqs = Invoke-WebRequest -Uri "$base/api/admin/faqs?active=false" -WebSession $session
Write-Host "FAQs: $($faqs.StatusCode)" -ForegroundColor Green

# Enquiries
$enq = Invoke-WebRequest -Uri "$base/api/admin/enquiries?page=1&limit=5" -WebSession $session
Write-Host "Enquiries: $($enq.StatusCode)" -ForegroundColor Green

# Users
$users = Invoke-WebRequest -Uri "$base/api/admin/users" -WebSession $session
Write-Host "Users: $($users.StatusCode)" -ForegroundColor Green

# Testimonials
$test = Invoke-WebRequest -Uri "$base/api/admin/testimonials" -WebSession $session
Write-Host "Testimonials: $($test.StatusCode)" -ForegroundColor Green

# Stats
$stats = Invoke-WebRequest -Uri "$base/api/admin/stats" -WebSession $session
Write-Host "Stats: $($stats.StatusCode)" -ForegroundColor Green

# Content
$content = Invoke-WebRequest -Uri "$base/api/admin/content?active=false" -WebSession $session
Write-Host "Content: $($content.StatusCode)" -ForegroundColor Green

# Media
$media = Invoke-WebRequest -Uri "$base/api/admin/media?page=1&limit=5" -WebSession $session
Write-Host "Media: $($media.StatusCode)" -ForegroundColor Green

# Settings
$settings = Invoke-WebRequest -Uri "$base/api/admin/settings" -WebSession $session
Write-Host "Settings: $($settings.StatusCode)" -ForegroundColor Green

Write-Host "`n✅ All API tests complete!" -ForegroundColor Cyan
```

---

## 📋 Default Credentials
- **Email**: `superadmin@krdcleancare.com`
- **Password**: `Admin@123`

## 🔑 Authentication
All admin APIs use HTTP-only cookies. Login first, then the cookie is automatically sent with subsequent requests.

## 📌 Notes
- All admin routes require authentication (except public APIs)
- User management requires `superadmin` role
- File uploads use `multipart/form-data`
- JSON APIs use `Content-Type: application/json`
- Pagination: `?page=1&limit=10`
- Status filters: `?status=new|read|replied|closed` (enquiries), `?status=published|draft|archived` (blog)
