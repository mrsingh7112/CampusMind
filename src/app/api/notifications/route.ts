import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get notifications for a recipient
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const recipientId = searchParams.get('recipientId')
    const recipientType = searchParams.get('recipientType')

    if (!recipientId || !recipientType) {
      return NextResponse.json({ error: 'Recipient ID and type are required' }, { status: 400 })
    }

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId,
        recipientType,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// Create a new notification
export async function POST(request: Request) {
  try {
    const { recipientId, recipientType, title, message } = await request.json()

    if (!recipientId || !recipientType || !title || !message) {
      return NextResponse.json({ 
        error: 'Recipient ID, recipient type, title, and message are required' 
      }, { status: 400 })
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        recipientId,
        recipientType,
        status: 'UNREAD',
        read: false
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'NOTIFY',
        entity: recipientType,
        details: `Sent notification: ${title}`
      }
    })

    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error: any) {
    console.error('Error creating notification:', error)
    return NextResponse.json({
      error: 'Failed to create notification',
      details: error.message
    }, { status: 500 })
  }
}

// Mark notification as read
export async function PATCH(request: Request) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        read: true,
        status: 'READ'
      }
    })

    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
} 