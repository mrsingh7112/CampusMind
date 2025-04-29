import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student's enrolled courses with faculty information
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: session.user.id,
        status: 'ENROLLED'
      },
      include: {
        course: {
          include: {
            faculty: {
              select: {
                name: true
              }
            },
            assignments: true,
            TimeTableSlot: true
          }
        }
      }
    })

    // Format the response
    const formattedCourses = enrollments.map(enrollment => ({
      id: enrollment.course.id,
      code: enrollment.course.code,
      name: enrollment.course.name,
      credits: enrollment.course.credits,
      faculty: enrollment.course.faculty,
      schedule: enrollment.course.TimeTableSlot,
      assignments: enrollment.course.assignments
    }))

    return NextResponse.json(formattedCourses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId: session.user.id,
        courseId,
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // Enroll student in the course
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId: session.user.id,
        courseId,
        status: 'ENROLLED'
      }
    })

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Error enrolling in course:', error)
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    )
  }
} 