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

    const { classId, date, attendance } = await request.json()

    // Validate required fields
    if (!classId || !date || !attendance) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the faculty ID from the session
    const facultyId = session.user.id

    // Get the class and subject information
    const classInfo = await prisma.course.findFirst({
      where: {
        code: classId,
        facultyId
      }
    })

    if (!classInfo) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Create attendance records for each student
    const attendancePromises = Object.entries(attendance).map(([studentId, status]) => {
      return prisma.attendance.create({
        data: {
          date: new Date(date),
          isPresent: status === 'PRESENT',
          student: { connect: { id: studentId } },
          faculty: { connect: { id: facultyId } },
          class: { connect: { id: classInfo.id } },
          subject: { connect: { id: classInfo.id } } // Assuming subject ID is same as class ID for simplicity
        }
      })
    })

    await Promise.all(attendancePromises)

    return NextResponse.json({
      message: 'Attendance submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting attendance:', error)
    return NextResponse.json(
      { error: 'Failed to submit attendance' },
      { status: 500 }
    )
  }
} 