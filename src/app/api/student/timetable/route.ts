import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const studentId = session.user.id;

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { 
        courseId: true, 
        currentSemester: true, 
        course: { select: { subjects: true } }
      },
    });

    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    const studentSubjects = student.course?.subjects.map(sub => sub.id) || [];

    const timetableSlots = await prisma.timetableSlot.findMany({
      where: {
        courseId: student.courseId,
        subjectId: { in: studentSubjects },
      },
      include: {
        subject: { select: { name: true, code: true } },
        faculty: { select: { name: true } },
        room: { select: { name: true } },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(timetableSlots);
  } catch (error) {
    console.error('Error fetching student timetable:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 