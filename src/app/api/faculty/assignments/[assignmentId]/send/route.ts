import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assignmentId } = params
    const facultyId = session.user.id

    // Get the assignment and verify faculty ownership
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        facultyId
      },
      include: {
        subject: {
          include: {
            course: {
              include: {
                students: true
              }
            }
          }
        }
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update assignment status to 'sent'
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: 'sent' }
    })

    // Get all students in the course
    const students = assignment.subject.course.students

    // Create notifications for all students
    const notifications = await Promise.all(
      students.map(student =>
        prisma.notification.create({
          data: {
            title: 'New Assignment',
            message: `New assignment "${assignment.title}" has been posted for ${assignment.subject.name}. Due: ${assignment.dueDate.toLocaleDateString()}`,
            recipientId: student.id,
            recipientType: 'STUDENT'
          }
        })
      )
    )

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment,
      notificationsSent: notifications.length
    })
  } catch (error) {
    console.error('Error sending assignment:', error)
    return NextResponse.json(
      { error: 'Failed to send assignment' },
      { status: 500 }
    )
  }
} 