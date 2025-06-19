import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = params

    // Get the faculty ID from the session
    const facultyId = session.user.id

    // Verify the faculty teaches this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        facultyId
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or unauthorized' },
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