import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if accessing admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = request.cookies.get('session')
    
    if (!session) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}