import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Get notifications for a recipient
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's role and ID
    const { role, id: userId } = session.user

    let notifications

    if (role === 'STUDENT') {
      // For students, get notifications only for their enrolled subjects
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          enrollments: {
            include: {
              subject: true
            }
          }
        }
      })

      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }

      // Get subject IDs the student is enrolled in
      const enrolledSubjectIds = student.enrollments?.map(e => e.subjectId) || []

      // Fetch notifications for enrolled subjects
      notifications = await prisma.notification.findMany({
        where: {
          subjectId: {
            in: enrolledSubjectIds
          }
        },
        include: {
          subject: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else if (role === 'FACULTY') {
      // For faculty, get notifications for subjects they teach
      const faculty = await prisma.faculty.findUnique({
        where: { userId },
        include: {
          subjects: true
        }
      })

      if (!faculty) {
        return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
      }

      const taughtSubjectIds = faculty.subjects?.map(s => s.id) || []

      notifications = await prisma.notification.findMany({
        where: {
          subjectId: {
            in: taughtSubjectIds
          }
        },
        include: {
          subject: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // For admin, get all notifications
      notifications = await prisma.notification.findMany({
        include: {
          subject: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    console.log("Notifications before sending:", notifications);
    const serializableNotifications = JSON.parse(JSON.stringify(notifications));
    return NextResponse.json(serializableNotifications)

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