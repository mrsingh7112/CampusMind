import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all assignments for the student's enrolled courses
    const assignments = await prisma.assignment.findMany({
      where: {
        course: {
          enrollments: {
            some: {
              studentId: session.user.id,
              status: 'ENROLLED'
            }
          }
        }
      },
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        },
        submissions: {
          where: {
            studentId: session.user.id
          }
        }
      }
    })

    // Format assignments with submission status
    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      course: assignment.course,
      status: assignment.submissions.length > 0 ? 'SUBMITTED' : 'PENDING',
      submission: assignment.submissions[0] || null,
      maxScore: assignment.maxScore
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assignmentId, submissionUrl } = await request.json()

    // Create a new submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: session.user.id,
        submissionUrl,
        submissionDate: new Date(),
        status: 'SUBMITTED'
      }
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Error submitting assignment:', error)
    return NextResponse.json(
      { error: 'Failed to submit assignment' },
      { status: 500 }
    )
  }
} 