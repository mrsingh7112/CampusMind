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
    const sessions = await prisma.adminSession.findMany({
      where: { adminId: session.user.id },
      orderBy: { lastActive: 'desc' }
    })
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Error fetching admin sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await req.json()
    const adminSession = await prisma.adminSession.findUnique({ where: { id } })
    if (!adminSession || adminSession.adminId !== session.user.id) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 })
    }
    await prisma.adminSession.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking admin session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 