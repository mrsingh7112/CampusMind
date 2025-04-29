import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Simple ML model for attendance prediction
function predictAttendance(historicalData: number[]): number {
  // Using a simple moving average with trend
  const recentAttendance = historicalData.slice(-3)
  const average = recentAttendance.reduce((a, b) => a + b, 0) / recentAttendance.length
  const trend = (recentAttendance[recentAttendance.length - 1] - recentAttendance[0]) / 2
  
  let prediction = average + trend
  // Ensure prediction stays within reasonable bounds
  prediction = Math.min(Math.max(prediction, 0), 100)
  
  return prediction
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student's attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: session.user.id,
      },
      orderBy: {
        date: 'desc',
      },
    })

    // Calculate attendance statistics
    const total = attendanceRecords.length
    const present = attendanceRecords.filter(record => record.isPresent).length
    const absent = total - present
    const late = attendanceRecords.filter(record => record.isPresent && record.date > record.updatedAt).length

    // Calculate overall attendance percentage
    const overall = total > 0 ? (present / total) * 100 : 0

    // Get previous attendance pattern (last 10 records)
    const previousAttendance = attendanceRecords
      .slice(0, 10)
      .map(record => record.isPresent ? 100 : 0)

    return NextResponse.json({
      overall: Math.round(overall * 10) / 10,
      present,
      absent,
      late,
      previousAttendance,
      records: attendanceRecords
    })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
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

    const { date, isPresent, classId, subjectId } = await request.json()

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        date: new Date(date),
        isPresent,
        studentId: session.user.id,
        classId,
        subjectId,
        facultyId: '', // This should be set by the faculty marking attendance
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error recording attendance:', error)
    return NextResponse.json(
      { error: 'Failed to record attendance' },
      { status: 500 }
    )
  }
} 