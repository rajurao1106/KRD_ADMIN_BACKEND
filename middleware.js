import { NextResponse } from 'next/server'

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://krd-clean-and-care.vercel.app",
  "https://krd-admin-backend-five.vercel.app",
]

function addCorsHeaders(response, origin) {
  const corsOrigin = allowedOrigins.includes(origin)
    ? origin
    : "https://krd-clean-and-care.vercel.app"

  response.headers.set("Access-Control-Allow-Origin", corsOrigin)
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept")
  response.headers.set("Access-Control-Allow-Credentials", "true")
  return response
}

export function middleware(request) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get("origin") ?? ""

  // ✅ CORS — API routes handle karo
  if (pathname.startsWith("/api")) {
    // OPTIONS preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigins.includes(origin)
            ? origin
            : "https://krd-clean-and-care.vercel.app",
          "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      })
    }

    const response = NextResponse.next()
    return addCorsHeaders(response, origin)
  }

  // ✅ Auth — Root path redirect
  const token = request.cookies.get('krd_admin_token')?.value

  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // ✅ Auth — Admin routes protect karo (login ke alawa)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // ✅ Auth — Login pe logged-in user ko redirect karo
  if (pathname === '/admin/login') {
    if (token) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/api/:path*',   // ✅ CORS ke liye add kiya
  ],
}