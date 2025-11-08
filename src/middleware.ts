import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isComingSoonMode = process.env.NEXT_PUBLIC_COMING_SOON_MODE === 'true'

  // In coming soon mode, disable all routes except home, admin, and API
  if (isComingSoonMode) {
    const pathname = request.nextUrl.pathname

    // Allow these paths in production
    const allowedPaths = [
      '/',
      '/admin',
      '/api',
      '/_next',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
    ]

    // Check if the current path starts with any allowed path
    const isAllowed = allowedPaths.some((path) => {
      if (path === '/') {
        return pathname === '/'
      }
      return pathname.startsWith(path)
    })

    // If not allowed, redirect to home with a 404-like response
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
