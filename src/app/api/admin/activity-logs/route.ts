import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { type, message } = await request.json()
    if (!type || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const log = await prisma.activityLog.create({
      data: { type, message },
    })
    return NextResponse.json({ success: true, data: log })
  } catch (error) {
    console.error('Error creating activity log:', error)
    return NextResponse.json({ error: 'Failed to create activity log' }, { status: 500 })
  }
} 