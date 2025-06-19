import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  // `withAuth` augments the Next.js `Request` object with a `token` field
  function middleware(req) {
    // console.log("Token: ", req.nextUrl.pathname, req.nextauth.token)

    // Redirect if not authorized
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
      return NextResponse.rewrite(new URL("/auth/login?message=You are not authorized to view this page.", req.url))
    }
    if (req.nextUrl.pathname.startsWith("/faculty") && req.nextauth.token?.role !== "faculty") {
      return NextResponse.rewrite(new URL("/auth/login?message=You are not authorized to view this page.", req.url))
    }
    if (req.nextUrl.pathname.startsWith("/student") && req.nextauth.token?.role !== "student") {
      return NextResponse.rewrite(new URL("/auth/login?message=You are not authorized to view this page.", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to login, and API routes that do not require authentication
        if (req.nextUrl.pathname.startsWith("/api/auth") || req.nextUrl.pathname.startsWith("/auth/login") || req.nextUrl.pathname.startsWith("/api/announcements")) {
          return true
        }
        // Allow authenticated users to access their respective dashboards
        if (token) {
          if (req.nextUrl.pathname.startsWith("/admin") && token.role === "admin") return true;
          if (req.nextUrl.pathname.startsWith("/faculty") && token.role === "faculty") return true;
          if (req.nextUrl.pathname.startsWith("/student") && token.role === "student") return true;
          // If it's a profile page, let the specific page handle it based on session
          if (req.nextUrl.pathname.includes("/profile")) return true;
          // For all other cases, if token exists, allow access for now
          return true;
        }
        // If no token, redirect to login
        return false
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/faculty/:path*',
    '/student/:path*',
    '/api/announcements/:path*'
  ],
} 