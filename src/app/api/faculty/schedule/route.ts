import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { startOfWeek, endOfWeek, addDays, format, parse, isValid } from 'date-fns'

// Helper function to convert 12-hour time (with AM/PM) to HH:mm (24-hour) format
function convertTo24Hour(timeStr: string): string {
  // If the time is already in HH:mm format, return it as is
  if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    return timeStr;
  }

  // Normalize 'P' to 'PM' and 'A' to 'AM'
  let normalizedTimeStr = timeStr.replace(/(\d+:\d+)\s*([ap])\s*$/i, (match, time, period) => {
    return `${time} ${period.toUpperCase()}M`;
  });

  // Try parsing with 'hh:mm a' (e.g., '08:00 AM', '01:00 PM')
  let parsedTime = parse(normalizedTimeStr, 'hh:mm a', new Date());

  // If parsing with 'hh:mm a' fails, try with 'h:mm a' (e.g., '8:00 AM', '1:00 PM')
  if (!isValid(parsedTime)) {
    parsedTime = parse(normalizedTimeStr, 'h:mm a', new Date());
  }
  
  if (isValid(parsedTime)) {
    return format(parsedTime, 'HH:mm');
  } else {
    console.warn(`Could not parse time string: ${timeStr}. Returning original.`);
    return timeStr; // Return original if parsing fails completely
  }
}

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
    const timeTableSlots = await prisma.TimetableSlot.findMany({
      where: {
        facultyId,
        dayOfWeek: {
          gte: 1,
          lte: 5
        }
      },
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        },
        room: true
      }
    })

    // Format the timetable slots into events
    const events = timeTableSlots.map(slot => {
      // slot.dayOfWeek: 1=Monday, 7=Sunday; startOfWeek is Sunday
      const eventDate = addDays(startOfWeek(date), (slot.dayOfWeek % 7))
      return {
        id: slot.id,
        title: `${slot.course.code} - ${slot.course.name}`,
        date: eventDate,
        startTime: convertTo24Hour(slot.startTime),
        endTime: convertTo24Hour(slot.endTime),
        location: slot.room ? `${slot.room.name} (${slot.room.building}, Floor ${slot.room.floor})` : '',
        type: 'class'
      }
    })

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

    // Get all custom schedule items for this faculty in the selected week
    const customSchedules = await prisma.schedule.findMany({
      where: {
        facultyId,
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    })

    // Add custom schedules to events
    events.push(
      ...customSchedules.map(schedule => ({
        id: schedule.id,
        title: schedule.title,
        date: schedule.date,
        startTime: convertTo24Hour(schedule.startTime),
        endTime: convertTo24Hour(schedule.endTime),
        description: schedule.description || '',
        priority: schedule.priority,
        isCompleted: schedule.isCompleted,
        type: schedule.type || 'custom',
        location: '', // Custom schedules don't have a location field in your schema
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