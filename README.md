# KRD Clean and Care — Admin Panel & Backend API

> Next.js 14+ fullstack admin panel with MySQL backend for managing KRD Clean and Care business operations.

**Live URL:** https://hotpink-jay-827876.hostingersite.com

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | JavaScript (ES6+) |
| Database | MySQL (Aiven Cloud / Hostinger compatible) |
| Authentication | JWT with httpOnly cookies |
| Styling | Tailwind CSS |
| File Storage | Local filesystem (`public/uploads/`) |
| Image Processing | Sharp |
| Deployment | Hostinger Node.js Hosting |

---

## 2. Project Structure

```
krd-fullstack/
├── app/
│   ├── layout.js                 # Root layout (Inter font, dark theme)
│   ├── page.js                   # Root redirect → /admin/login
│   ├── globals.css               # Global styles
│   ├── admin/                    # Admin panel pages
│   │   ├── layout.js             # Admin layout (sidebar, topbar, auth check)
│   │   ├── page.js               # Dashboard
│   │   ├── login/                # Login page
│   │   ├── products/             # Products management
│   │   ├── categories/           # Product categories
│   │   ├── blog/                 # Blog posts management
│   │   ├── content/              # Page sections (CMS)
│   │   ├── faqs/                 # FAQ management
│   │   ├── testimonials/         # Testimonials
│   │   ├── stats/                # Impact numbers
│   │   ├── enquiries/            # Contact enquiries
│   │   ├── media/                # Media library
│   │   ├── users/                # User management (superadmin only)
│   │   └── settings/             # Site settings
│   └── api/
│       ├── auth/                 # Authentication endpoints
│       │   ├── login/            # POST - Login
│       │   ├── logout/           # POST - Logout
│       │   └── me/               # GET - Current user
│       ├── admin/                # Protected CRUD endpoints
│       │   ├── dashboard/        # GET - Dashboard stats
│       │   ├── products/         # CRUD - Products
│       │   ├── categories/       # CRUD - Product categories
│       │   ├── blog/             # CRUD - Blog posts
│       │   ├── blog-categories/  # GET - Blog categories
│       │   ├── content/          # CRUD - Page sections
│       │   ├── faqs/             # CRUD - FAQs
│       │   ├── testimonials/     # CRUD - Testimonials
│       │   ├── stats/            # CRUD - Impact stats
│       │   ├── enquiries/        # CRUD - Contact enquiries
│       │   ├── media/            # CRUD - Media library
│       │   ├── users/            # CRUD - User management
│       │   └── settings/         # GET/PUT - Site settings
│       └── public/               # Public read-only endpoints
│           └── products/         # GET - Public products
├── lib/
│   ├── db.js                     # MySQL connection pool
│   ├── auth.js                   # JWT utilities (generate, verify, hash)
│   ├── middleware.js             # withAuth wrapper for API routes
│   └── upload.js                 # File upload handler (multer)
├── middleware.js                 # Next.js middleware (route protection)
├── public/
│   ├── uploads/                  # Uploaded files storage
│   └── navbar/logo.png           # Admin logo
├── database.sql                  # Complete MySQL schema + seed data
├── .env                          # Environment variables
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS config
└── package.json                  # Dependencies & scripts
```

---

## 3. Getting Started

### Prerequisites

- Node.js 18+ installed
- MySQL database (local, Aiven, or Hostinger)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Edit `.env` file:

```env
# Database
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
DB_SSL=true

# Auth
JWT_SECRET=your-super-secret-key-minimum-32-characters

# App
NEXT_PUBLIC_APP_URL=https://hotpink-jay-827876.hostingersite.com
NODE_ENV=development
```

### Step 3: Import Database Schema

**Option A — Using phpMyAdmin (Hostinger):**
1. Open phpMyAdmin from hPanel
2. Select your database
3. Click Import → Upload `database.sql` → Go

**Option B — Using command line:**
```bash
node -e "const mysql=require('mysql2/promise');const fs=require('fs');(async()=>{const c=await mysql.createConnection({host:process.env.DB_HOST,port:parseInt(process.env.DB_PORT),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,ssl:{rejectUnauthorized:false},multipleStatements:true});let sql=fs.readFileSync('database.sql','utf8');sql=sql.replace(/CREATE DATABASE.*?;/gi,'');sql=sql.replace(/USE\\s+\\w+;/gi,'');await c.query(sql);console.log('Done!');await c.end()})()"
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open: http://localhost:3000 → Redirects to login page

---

## 4. Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Superadmin | superadmin@krdcleancare.com | Admin@123 |
| Admin | admin@krdcleancare.com | Admin@123 |

> ⚠️ Change passwords immediately after first login!

---

## 5. Authentication Flow

```
User opens localhost:3000
    ↓
Middleware checks cookie "krd_admin_token"
    ↓
No token → Redirect to /admin/login
    ↓
User submits email + password
    ↓
POST /api/auth/login → Validates credentials → Sets httpOnly cookie
    ↓
Redirect to /admin (Dashboard)
    ↓
Admin layout calls GET /api/auth/me → Loads user data + sidebar
```

**Token:** JWT stored in httpOnly cookie (`krd_admin_token`), expires in 7 days.

---

## 6. API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current user info |

### Admin APIs (Protected — requires auth cookie)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard statistics |
| GET/POST | `/api/admin/products` | List / Create products |
| GET/PUT/DELETE | `/api/admin/products/[id]` | Get / Update / Delete product |
| GET/POST | `/api/admin/categories` | List / Create categories |
| GET/PUT/DELETE | `/api/admin/categories/[id]` | Get / Update / Delete category |
| GET/POST | `/api/admin/blog` | List / Create blog posts |
| GET/PUT/DELETE | `/api/admin/blog/[id]` | Get / Update / Delete post |
| GET | `/api/admin/blog-categories` | List blog categories |
| GET/POST | `/api/admin/content` | List / Create page sections |
| GET/PUT/DELETE | `/api/admin/content/[id]` | Get / Update / Delete section |
| GET/POST | `/api/admin/faqs` | List / Create FAQs |
| GET/PUT/DELETE | `/api/admin/faqs/[id]` | Get / Update / Delete FAQ |
| GET/POST | `/api/admin/testimonials` | List / Create testimonials |
| GET/PUT/DELETE | `/api/admin/testimonials/[id]` | Get / Update / Delete testimonial |
| GET/POST | `/api/admin/stats` | List / Create stats |
| GET/PUT/DELETE | `/api/admin/stats/[id]` | Get / Update / Delete stat |
| GET/POST | `/api/admin/enquiries` | List / Create enquiries |
| GET/PUT/DELETE | `/api/admin/enquiries/[id]` | Get / Update / Delete enquiry |
| GET/POST | `/api/admin/media` | List / Upload media |
| DELETE | `/api/admin/media/[id]` | Delete media file |
| GET/POST | `/api/admin/users` | List / Create users |
| GET/PUT/DELETE | `/api/admin/users/[id]` | Get / Update / Delete user |
| GET/PUT | `/api/admin/settings` | Get / Update site settings |

### Public APIs (No auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/products` | Public product listing |

---

## 7. Role Permissions

| Feature | Admin | Superadmin |
|---------|:-----:|:----------:|
| Dashboard | ✅ | ✅ |
| Products CRUD | ✅ | ✅ |
| Categories CRUD | ✅ | ✅ |
| Blog CRUD | ✅ | ✅ |
| Page Sections CRUD | ✅ | ✅ |
| FAQs CRUD | ✅ | ✅ |
| Testimonials CRUD | ✅ | ✅ |
| Stats CRUD | ✅ | ✅ |
| Enquiries Management | ✅ | ✅ |
| Media Library | ✅ | ✅ |
| Site Settings | ✅ | ✅ |
| User Management | ❌ | ✅ |

---

## 8. Database Schema

### Tables (15 total)

| Table | Purpose |
|-------|---------|
| `users` | Admin users with roles |
| `site_settings` | Key-value site configuration |
| `content_sections` | CMS page sections (hero, about, etc.) |
| `product_categories` | Product category hierarchy |
| `products` | Product catalog |
| `blog_categories` | Blog post categories |
| `blog_posts` | Blog articles |
| `faqs` | Frequently asked questions |
| `testimonials` | Customer testimonials |
| `enquiries` | Contact form submissions |
| `stats` | Impact numbers display |
| `nav_items` | Navigation menu items |
| `footer_sections` | Footer content blocks |
| `media` | Media library records |
| `audit_logs` | Action audit trail |

---

## 9. File Uploads

All uploaded files are stored in `public/uploads/`:

```
public/uploads/
├── sections/       ← Page section images
├── products/       ← Product images
├── categories/     ← Category images
├── blog/           ← Blog featured images
├── testimonials/   ← Testimonial avatars
└── general/        ← Media library files
```

**Max file size:** 5MB  
**Allowed types:** JPEG, PNG, WebP, GIF, SVG

---

## 10. Deployment on Hostinger

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-repo.git
git push -u origin main
```

### Step 2: Hostinger Node.js Setup

1. Login to Hostinger hPanel
2. Go to **Website → Node.js**
3. Create new application:
   - **Node.js version:** 18.x or 20.x
   - **Startup command:** `npm run build && npm start`
   - **Port:** 3000
4. Connect GitHub repository
5. Add environment variables in hPanel:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `DB_SSL=true`
   - `JWT_SECRET=your-secret`
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_APP_URL=https://hotpink-jay-827876.hostingersite.com`

### Step 3: Database Setup

1. Go to **Databases → MySQL** in hPanel
2. Create database and user
3. Import `database.sql` via phpMyAdmin
4. Update environment variables with DB credentials

### Step 4: Domain

Current temporary domain: `hotpink-jay-827876.hostingersite.com`  
Update `NEXT_PUBLIC_APP_URL` when custom domain is configured.

---

## 11. Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 12. Environment Variables Reference

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DB_HOST` | ✅ | MySQL server hostname |
| `DB_PORT` | ✅ | MySQL port (default: 3306) |
| `DB_USER` | ✅ | Database username |
| `DB_PASSWORD` | ✅ | Database password |
| `DB_NAME` | ✅ | Database name |
| `DB_SSL` | ❌ | Enable SSL (`true`/`false`) |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens (32+ chars) |
| `NODE_ENV` | ❌ | `development` or `production` |
| `NEXT_PUBLIC_APP_URL` | ❌ | Public URL of the application |

---

## 13. Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens stored in httpOnly cookies (not accessible via JavaScript)
- Secure cookie flag enabled in production (HTTPS only)
- All admin API routes protected via middleware auth check
- File uploads validated for type and size
- SQL queries use parameterized statements (no SQL injection)
- CORS handled by Next.js defaults

---

## 14. Troubleshooting

| Issue | Solution |
|-------|----------|
| Login returns 401 | Check DB connection, verify password hash |
| Cookie not persisting | Set `NODE_ENV=development` for localhost |
| Image upload fails | Ensure `public/uploads/` directories exist |
| DB connection timeout | Check `DB_HOST`, `DB_PORT`, firewall rules |
| Build fails with CSS error | Ensure `@import` is before `@tailwind` in globals.css |

---

## 15. Support

- **Project:** KRD Clean and Care Admin Panel
- **Domain:** hotpink-jay-827876.hostingersite.com
- **Contact:** info@krdcleanandcare.com
#   K R D _ A D M I N _ B A C K E N D  
 