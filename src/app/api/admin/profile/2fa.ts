import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

// Enable 2FA: POST
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Generate secret
    const secret = speakeasy.generateSecret({ name: 'CampusMind Admin' })
    // Save secret temporarily (not enabled until verified)
    await prisma.admin.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret.base32 }
    })
    // Generate QR code
    const qr = await qrcode.toDataURL(secret.otpauth_url)
    return NextResponse.json({ qr, secret: secret.base32 })
  } catch (error) {
    console.error('Error enabling 2FA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Verify 2FA: PUT
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { token } = await req.json()
    const admin = await prisma.admin.findUnique({ where: { id: session.user.id } })
    if (!admin || !admin.twoFactorSecret) {
      return NextResponse.json({ error: '2FA not initialized' }, { status: 400 })
    }
    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: 'base32',
      token
    })
    if (!verified) {
      return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 400 })
    }
    // Optionally, set a flag for 2FA enabled (if you want a separate field)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error verifying 2FA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Disable 2FA: DELETE
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await prisma.admin.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: null }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 