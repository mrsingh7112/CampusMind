import { NextResponse } from 'next/server'
import { compare } from 'bcrypt'
import { SignJWT } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Admin credentials
const ADMIN_EMAIL = 'baljinder.s7112@gmail.com'
const ADMIN_PASSWORD = 'Simbal7112'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { identifier, password } = data

    // Check for admin credentials
    if (identifier === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Create JWT token for admin
      const secret = new TextEncoder().encode(JWT_SECRET)
      const token = await new SignJWT({
        id: 'admin',
        email: ADMIN_EMAIL,
        role: 'ADMIN',
        name: 'Admin',
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(secret)

      const response = NextResponse.json({
        user: {
          id: 'admin',
          email: ADMIN_EMAIL,
          name: 'Admin',
          role: 'ADMIN',
        },
        redirectTo: '/admin/dashboard'
      })

      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      return response
    }

    // Find user by email or faculty/student ID
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { tokenId: identifier }
        ]
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if faculty account is approved
    if (user.role === 'FACULTY' && !user.approved) {
      return NextResponse.json(
        { error: 'Your account is pending approval' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret)

    // Determine redirect URL based on role
    const redirectMap = {
      'FACULTY': '/faculty/dashboard',
      'STUDENT': '/student/dashboard',
      'ADMIN': '/admin/dashboard'
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      redirectTo: redirectMap[user.role] || '/'
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 hours
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    )
  }
} 