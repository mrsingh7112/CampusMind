import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { startOfWeek, endOfWeek } from 'date-fns'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const date = dateParam ? new Date(dateParam) : new Date()

    // Get the faculty ID from the session
    const facultyId = session.user.id

    // Get the week's start and end dates
    const weekStart = startOfWeek(date)
    const weekEnd = endOfWeek(date)

    // Get all timetable slots for this faculty's courses in the selected week
    const timeTableSlots = await prisma.timeTableSlot.findMany({
      where: {
        course: {
          facultyId
        }
      },
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    // Format the timetable slots into events
    const events = timeTableSlots.map(slot => ({
      id: slot.id,
      title: `${slot.course.code} - ${slot.course.name}`,
      date: weekStart, // You'll need to adjust this based on the day field
      startTime: slot.startTime,
      endTime: slot.endTime,
      location: slot.room,
      type: 'class'
    }))

    // Get all assignments due this week
    const assignments = await prisma.assignment.findMany({
      where: {
        facultyId,
        dueDate: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    // Add assignments to events
    events.push(
      ...assignments.map(assignment => ({
        id: assignment.id,
        title: `${assignment.course.code} Assignment Due: ${assignment.title}`,
        date: assignment.dueDate,
        startTime: '23:59',
        endTime: '23:59',
        location: 'Online',
        type: 'assignment'
      }))
    )

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
} 