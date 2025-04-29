import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Check if email and password match the default admin credentials
    if (email !== 'admin@campusmind.com' || password !== 'admin123') {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // In a real application, you would:
    // 1. Hash the password
    // 2. Use a proper authentication system
    // 3. Generate and return a JWT token
    // 4. Set up proper session management

    return NextResponse.json({
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error logging in' },
      { status: 500 }
    )
  }
} 