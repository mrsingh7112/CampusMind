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
      include: {
        activityLogs: true,
        sessions: true
      }
    })
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }
    // Remove sensitive fields
    const { password, twoFactorSecret, ...safeAdmin } = admin
    const data = {
      profile: safeAdmin,
      activityLogs: admin.activityLogs,
      sessions: admin.sessions
    }
    const json = JSON.stringify(data, null, 2)
    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="admin_personal_data.json"',
      },
    })
  } catch (error) {
    console.error('Error downloading admin personal data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 