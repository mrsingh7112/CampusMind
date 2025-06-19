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
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            department: { select: { name: true } },
            totalSemesters: true,
            subjects: { // Fetch subjects related to the course
              select: {
                id: true,
                name: true,
                code: true,
                semester: true,
                credits: true,
                type: true,
              },
              orderBy: { semester: 'asc' },
            },
          },
        },
      },
    });

    if (!student || !student.course) {
      return NextResponse.json({ message: 'Student not found or not enrolled in a course' }, { status: 404 });
    }

    return NextResponse.json({
      course: student.course,
      currentSemester: student.currentSemester,
    });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 