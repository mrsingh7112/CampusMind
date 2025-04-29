import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        sender: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, message, userId } = await request.json()
    if (!title || !message || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        userId,
      },
    })
    return NextResponse.json({ success: true, data: notification })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
} 