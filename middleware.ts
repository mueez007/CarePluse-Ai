import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings', '/medications', '/food-scanner', '/ai-companion', '/emergency', '/risk-screening', '/symptom-checker']
const authRoutes = ['/login', '/signup']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isApiRoute = pathname.startsWith('/api')
  const isPublicRoute = pathname === '/' || pathname === '/landing'
  const isStaticAsset = pathname.startsWith('/_next') || pathname === '/favicon.ico'

  // Skip middleware for API routes, public routes, and static assets
  if (isApiRoute || isPublicRoute || isStaticAsset) {
    return NextResponse.next()
  }

  const sessionToken = req.cookies.get('carepulse_session')?.value

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthPage = authRoutes.some(route => pathname.startsWith(route))

  // If user has session and tries to access auth pages, redirect to dashboard
  if (sessionToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If user has no session and tries to access protected pages, redirect to login
  if (!sessionToken && isProtected) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
