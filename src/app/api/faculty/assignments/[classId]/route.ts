import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { classId } = params

    // Get the faculty ID from the session
    const facultyId = session.user.id

    // Verify the faculty teaches this class
    const course = await prisma.course.findFirst({
      where: {
        code: classId,
        facultyId
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Class not found or unauthorized' },
        { status: 404 }
      )
    }

    // Get all assignments for this course
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: course.id,
        facultyId
      },
      include: {
        submissions: {
          select: {
            id: true,
            status: true,
            submittedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response
    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      createdAt: assignment.createdAt,
      submissionsCount: assignment.submissions.length,
      submittedCount: assignment.submissions.filter(s => s.status === 'SUBMITTED').length,
      gradedCount: assignment.submissions.filter(s => s.status === 'GRADED').length
    }))

    return NextResponse.json(formattedAssignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
} 