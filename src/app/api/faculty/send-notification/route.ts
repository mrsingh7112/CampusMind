import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { facultyId, message, title } = await request.json()

    if (!facultyId || !message || !title) {
      return NextResponse.json({ error: 'Faculty ID, title and message are required' }, { status: 400 })
    }

    // Check if faculty exists
    const faculty = await prisma.facultyMember.findUnique({
      where: { id: facultyId }
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        recipientId: facultyId,
        recipientType: 'FACULTY',
        status: 'UNREAD'
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'NOTIFY',
        entity: 'FACULTY',
        details: `Sent notification to faculty ${faculty.name}`
      }
    })

    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error: any) {
    console.error('Error sending notification:', error)
    return NextResponse.json({
      error: 'Failed to send notification',
      details: error.message
    }, { status: 500 })
  }
} 