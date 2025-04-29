import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Define protected routes and their allowed roles
const protectedRoutes = {
  '/faculty/dashboard': ['FACULTY'],
  '/student/dashboard': ['STUDENT'],
  '/admin/dashboard': ['ADMIN'],
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  // If no token and trying to access protected route, redirect to login
  if (!token && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    if (token) {
      // Verify and decode the JWT token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')
      const { payload } = await jwtVerify(token, secret)
      const userRole = payload.role as string

      // Check if user is trying to access a protected route
      if (isProtectedRoute(request.nextUrl.pathname)) {
        const allowedRoles = protectedRoutes[request.nextUrl.pathname as keyof typeof protectedRoutes]
        
        // If user's role is not allowed for this route
        if (!allowedRoles.includes(userRole)) {
          // Redirect based on role
          if (userRole === 'FACULTY') {
            return NextResponse.redirect(new URL('/faculty/dashboard', request.url))
          }
          if (userRole === 'STUDENT') {
            return NextResponse.redirect(new URL('/student/dashboard', request.url))
          }
          if (userRole === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
          }
        }
      }
    }
  } catch (error) {
    // If token is invalid, clear it and redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }

  return NextResponse.next()
}

function isProtectedRoute(pathname: string): boolean {
  if (!pathname) return false
  return Object.keys(protectedRoutes).some(route => pathname.startsWith(route))
}

export const config = {
  matcher: [
    '/faculty/dashboard/:path*',
    '/student/dashboard/:path*',
    '/admin/dashboard/:path*',
  ],
} 