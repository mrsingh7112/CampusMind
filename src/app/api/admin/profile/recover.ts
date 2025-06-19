import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// POST: Request password reset (send email with token)
export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      // For security, do not reveal if email exists
      return NextResponse.json({ success: true })
    }
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 30) // 30 min
    await prisma.admin.update({
      where: { id: admin.id },
      data: { resetToken: token, resetTokenExpiry: expires }
    })
    // TODO: Send email with reset link (e.g., /admin/reset-password?token=...)
    // Placeholder: console.log(`Reset link: https://yourdomain.com/admin/reset-password?token=${token}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error requesting password reset:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT: Reset password using token
export async function PUT(req: Request) {
  try {
    const { token, newPassword, confirmPassword } = await req.json()
    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }
    const admin = await prisma.admin.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() }
      }
    })
    if (!admin) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 