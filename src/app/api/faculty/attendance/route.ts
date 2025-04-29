import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { classId, date, attendance } = data

    // Validate faculty's permission to mark attendance for this class
    const faculty = await prisma.user.findFirst({
      where: {
        email: session.user?.email,
        role: 'FACULTY'
      }
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Save attendance records
    const attendanceRecords = Object.entries(attendance).map(([studentId, isPresent]) => ({
      date: new Date(date),
      studentId,
      facultyId: faculty.id,
      classId,
      isPresent: isPresent as boolean
    }))

    // Create attendance records in bulk
    await prisma.attendance.createMany({
      data: attendanceRecords,
      skipDuplicates: true
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving attendance:', error)
    return NextResponse.json(
      { error: 'Failed to save attendance' },
      { status: 500 }
    )
  }
} 