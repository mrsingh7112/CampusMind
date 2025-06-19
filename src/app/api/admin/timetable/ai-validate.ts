import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { subjectId, facultyId, roomId, day, startTime, type, slotId } = await request.json();
    
    // If type is FREE or LUNCH, always return valid
    if (type === 'FREE' || type === 'LUNCH') {
      return NextResponse.json({ feedback: 'Valid' });
    }

    let feedback = '';
    let suggestions = [];

    // Check if subject exists
    const subject = subjectId ? await prisma.subject.findUnique({ 
      where: { id: subjectId },
      include: { course: true }
    }) : null;
    
    if (!subject) {
      feedback += '⚠️ Subject not found. ';
    } else {
      // Check if subject is appropriate for the course/semester
      if (subject.courseId) {
        suggestions.push(`Subject ${subject.name} is assigned to course ${subject.course.name}`);
      }
    }

    // Check if faculty exists and get department
    const faculty = facultyId ? await prisma.faculty.findUnique({ 
      where: { id: facultyId },
      include: { department: true }
    }) : null;
    
    if (!faculty) {
      feedback += '⚠️ Faculty not found. ';
    } else {
      // Check faculty's weekly load
      const weeklyLoad = await prisma.timetableSlot.count({
        where: {
          facultyId,
          dayOfWeek: day,
          id: { not: slotId } // Exclude current slot if editing
        }
      });
      
      if (weeklyLoad >= 4) {
        feedback += '⚠️ Faculty has high teaching load on this day. ';
      }
      
      if (faculty.department) {
        suggestions.push(`Faculty belongs to ${faculty.department.name} department`);
      }
    }

    // Check if room exists and is appropriate
    const room = roomId ? await prisma.room.findUnique({ 
      where: { id: roomId },
      include: { type: true }
    }) : null;
    
    if (!room) {
      feedback += '⚠️ Room not found. ';
    } else {
      // Check room capacity and type
      if (room.type === 'LAB' && subject?.type !== 'LAB') {
        feedback += '⚠️ Lab room assigned for non-lab subject. ';
      }
      if (room.type === 'LECTURE' && subject?.type === 'LAB') {
        feedback += '⚠️ Lecture room assigned for lab subject. ';
      }
    }

    // Check if faculty is already booked at this time
    if (facultyId && day && startTime) {
      const conflict = await prisma.timetableSlot.findFirst({
        where: {
          facultyId,
          dayOfWeek: day,
          startTime,
          id: { not: slotId } // Exclude current slot if editing
        },
        include: {
          subject: true,
          course: true
        }
      });
      
      if (conflict) {
        feedback += `⚠️ Faculty is already assigned to ${conflict.subject.name} for ${conflict.course.name} at this time. `;
      }
    }

    // Check if room is already booked at this time
    if (roomId && day && startTime) {
      const conflict = await prisma.timetableSlot.findFirst({
        where: {
          roomId,
          dayOfWeek: day,
          startTime,
          id: { not: slotId } // Exclude current slot if editing
        },
        include: {
          subject: true,
          course: true
        }
      });
      
      if (conflict) {
        feedback += `⚠️ Room is already booked for ${conflict.subject.name} (${conflict.course.name}) at this time. `;
      }
    }

    // Check for consecutive classes
    if (facultyId && day && startTime) {
      const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];
      const currentIndex = timeSlots.indexOf(startTime);
      
      // Check previous slot
      if (currentIndex > 0) {
        const prevConflict = await prisma.timetableSlot.findFirst({
          where: {
            facultyId,
            dayOfWeek: day,
            startTime: timeSlots[currentIndex - 1],
            id: { not: slotId }
          }
        });
        if (prevConflict) {
          suggestions.push('Faculty has a class in the previous time slot');
        }
      }
      
      // Check next slot
      if (currentIndex < timeSlots.length - 1) {
        const nextConflict = await prisma.timetableSlot.findFirst({
          where: {
            facultyId,
            dayOfWeek: day,
            startTime: timeSlots[currentIndex + 1],
            id: { not: slotId }
          }
        });
        if (nextConflict) {
          suggestions.push('Faculty has a class in the next time slot');
        }
      }
    }

    if (!feedback) {
      feedback = 'Valid';
      if (suggestions.length > 0) {
        feedback += ' Suggestions: ' + suggestions.join('. ');
      }
    }

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error('AI validation error:', err);
    return NextResponse.json({ feedback: 'AI validation failed. Please check your input.' }, { status: 500 });
  }
} 