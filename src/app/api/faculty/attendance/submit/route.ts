import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subjectId, date, attendance } = await req.json()

    // Create attendance records for each student
    const attendanceRecords = await Promise.all(
      Object.entries(attendance).map(async ([studentId, data]: [string, any]) => {
        return prisma.studentAttendance.create({
          data: {
            studentId,
            subjectId,
            date: new Date(date),
            status: data.status, // Send status directly as string
            notes: data.notes || null,
            markedByFacultyId: session.user.id
          }
        })
      })
    )

    return NextResponse.json({ success: true, attendanceRecords })
  } catch (error) {
    console.error('Error submitting attendance:', error)
    return NextResponse.json(
      { error: 'Failed to submit attendance' },
      { status: 500 }
    )
  }
} 