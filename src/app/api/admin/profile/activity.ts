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
    const logs = await prisma.adminActivityLog.findMany({
      where: { adminId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching admin activity logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 