import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { facultyId } = await request.json()

    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 })
    }

    // Get faculty details
    const faculty = await prisma.facultyMember.findUnique({
      where: { id: facultyId },
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    // Check if faculty has already marked attendance today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const existingAttendance = await prisma.facultyAttendance.findFirst({
      where: {
        facultyId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance already marked for today' },
        { status: 400 }
      )
    }

    // Mark attendance
    const attendance = await prisma.facultyAttendance.create({
      data: {
        facultyId,
        date: today,
        time: new Date(),
      },
    })

    // Update faculty status to ACTIVE
    await prisma.facultyMember.update({
      where: { id: facultyId },
      data: { status: 'ACTIVE' },
    })

    // Schedule status update to INACTIVE after 8 hours
    setTimeout(async () => {
      await prisma.facultyMember.update({
        where: { id: facultyId },
        data: { status: 'INACTIVE' },
      })
    }, 8 * 60 * 60 * 1000) // 8 hours in milliseconds

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    })
  } catch (error: any) {
    console.error('Error marking attendance:', error)
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    )
  }
} 