import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { facultyId, date, status, notes } = await request.json()

    if (!facultyId || !date) {
      return NextResponse.json(
        { error: 'Faculty ID and date are required' },
        { status: 400 }
      )
    }

    // Check if faculty exists
    const faculty = await prisma.facultyMember.findUnique({
      where: { id: facultyId }
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    // Create or update attendance
    const attendance = await prisma.facultyAttendance.upsert({
      where: {
        facultyId_date: {
          facultyId,
          date: new Date(date)
        }
      },
      update: {
        status,
        notes
      },
      create: {
        facultyId,
        date: new Date(date),
        status,
        notes
      }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Attendance error:', error)
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get('facultyId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!facultyId) {
      return NextResponse.json(
        { error: 'Faculty ID is required' },
        { status: 400 }
      )
    }

    // Check if faculty exists
    const faculty = await prisma.facultyMember.findUnique({
      where: { id: facultyId }
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    // Build the where clause
    const where: any = { facultyId }
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get attendance records
    const attendance = await prisma.facultyAttendance.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Attendance fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
} 