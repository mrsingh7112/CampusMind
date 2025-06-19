import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        isSuperAdmin: true
      }
    })
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }
    return NextResponse.json(admin)
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const data = await req.json()
    // Check for unique email/username (if changed)
    if (data.email) {
      const existing = await prisma.admin.findFirst({ where: { email: data.email, id: { not: session.user.id } } })
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
    }
    if (data.username) {
      const existing = await prisma.admin.findFirst({ where: { username: data.username, id: { not: session.user.id } } })
      if (existing) {
        return NextResponse.json({ error: 'Username already in use' }, { status: 400 })
      }
    }
    const updated = await prisma.admin.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        phone: data.phone,
        profilePicture: data.profilePicture
      }
    })
    return NextResponse.json({ success: true, admin: updated })
  } catch (error) {
    console.error('Error updating admin profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 