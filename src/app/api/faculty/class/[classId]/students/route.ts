import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'FACULTY') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { classId } = params

    // Get the faculty's class and its enrolled students
    const students = await prisma.class.findUnique({
      where: {
        id: classId,
        facultyId: session.user.id
      },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true,
                enrollmentYear: true,
                semester: true
              }
            }
          }
        }
      }
    })

    if (!students) {
      return NextResponse.json(
        { error: 'Class not found or unauthorized' },
        { status: 404 }
      )
    }

    // Transform the data to return only student information
    const studentList = students.enrollments.map(enrollment => enrollment.student)

    return NextResponse.json(studentList)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 