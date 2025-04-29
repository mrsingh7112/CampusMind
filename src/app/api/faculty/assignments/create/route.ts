import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { classId, title, description, dueDate } = await request.json()

    // Validate required fields
    if (!classId || !title || !description || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    // Create the assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        course: { connect: { id: course.id } },
        faculty: { connect: { id: facultyId } }
      }
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
} 