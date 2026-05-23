  import { NextResponse } from 'next/server'
  import { verifyToken } from './auth'

  export function withAuth(handler, { requireSuperAdmin = false } = {}) {
    return async function(request, context) {
      const token = request.cookies.get('krd_admin_token')?.value
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const user = verifyToken(token)
      if (!user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      
      if (requireSuperAdmin && user.role !== 'superadmin') {
        return NextResponse.json({ error: 'Forbidden - Superadmin required' }, { status: 403 })
      }
      
      request.user = user
      
      // In Next.js 15+, params is a Promise - await it before passing to handler
      if (context && context.params) {
        const resolvedParams = await context.params
        return handler(request, { ...context, params: resolvedParams })
      }
      return handler(request, context)
    }
  }

  export function withPublic(handler) {
    return async function(request, context) {
      // In Next.js 15+, params is a Promise - await it before passing to handler
      if (context && context.params) {
        const resolvedParams = await context.params
        return handler(request, { ...context, params: resolvedParams })
      }
      return handler(request, context)
    }
  }
