import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Dummy announcement function
async function announceEvent(event: any, affectedUsers: any[]) {
  // In real code, send notifications to users
  // e.g., via email, push, or in-app notification
  // Here, just log
  console.log('Announcing event:', event, 'to', affectedUsers.map(u => u.name));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received payload:', body);
    const { courseId, semester, subject, room, day, startTime } = body;
    if (!courseId || !semester || !subject || !room || day === undefined || !startTime) {
      console.error('Missing required fields:', { courseId, semester, subject, room, day, startTime });
      return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }
    console.log('Processing slot assignment for:', {
      courseId,
      semester,
      subjectId: subject.id,
      roomId: room.id,
      day,
      startTime
    });
    // Remove any existing slot
    await prisma.timetableSlot.deleteMany({ where: { courseId, semester, dayOfWeek: day, startTime } });
    // Find facultyId
    let facultyId = null;
    if (body.faculty && body.faculty.id) {
      facultyId = body.faculty.id;
    } else {
      // Try to find assigned faculty for this subject
      const assigned = await prisma.facultySubject.findFirst({ where: { subjectId: subject.id } });
      if (assigned) {
        facultyId = assigned.facultyId;
        console.log('Found assigned faculty:', facultyId);
      } else {
        // Auto-assign: pick a random faculty from the course's department
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        console.log('Course found:', course);
        const deptFaculties = await prisma.faculty.findMany({ where: { departmentId: course.departmentId } });
        if (deptFaculties.length > 0) {
          facultyId = deptFaculties[0].id;
          console.log('Auto-assigned faculty from department:', facultyId);
        } else {
          const allFaculties = await prisma.faculty.findMany();
          if (allFaculties.length > 0) {
            facultyId = allFaculties[0].id;
            console.log('Auto-assigned faculty from all faculties:', facultyId);
          } else {
            console.error('No faculty available to assign.');
            return NextResponse.json({ success: false, message: 'No faculty available to assign.' }, { status: 400 });
          }
        }
      }
    }
    // Create new slot
    const slot = await prisma.timetableSlot.create({
      data: {
        courseId,
        subjectId: subject.id,
        facultyId,
        roomId: room.id,
        dayOfWeek: day,
        startTime,
        endTime: '', // You can calculate endTime from startTime if needed
        semester,
      },
    });
    console.log('Created slot:', slot);
    return NextResponse.json({ success: true, message: 'Slot assigned successfully.', slot });
  } catch (error) {
    console.error('Error in edit-slot:', error);
    return NextResponse.json({ success: false, message: 'Failed to assign slot.' }, { status: 500 });
  }
} 