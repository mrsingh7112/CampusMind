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
      select: { courseId: true },
    });

    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // Fetch all assignments relevant to the student's course
    const assignments = await prisma.assignment.findMany({
      where: {
        courseId: student.courseId,
      },
      include: {
        subject: { select: { name: true, code: true } },
        faculty: { select: { name: true } },
        submissions: {
          where: { studentId: studentId },
          select: { id: true, submittedAt: true, grade: true, status: true, submissionUrl: true },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });

    // Transform data to include submission status and simplify structure
    const formattedAssignments = assignments.map(assignment => {
      const submission = assignment.submissions[0] || null; // A student can have at most one submission per assignment
      
      let status = 'PENDING';
      if (submission) {
        status = submission.status;
      } else if (new Date(assignment.dueDate) < new Date()) {
        status = 'MISSED';
      }

      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        maxMarks: assignment.maxMarks,
        subject: assignment.subject,
        faculty: assignment.faculty,
        submissionStatus: status,
        submittedAt: submission?.submittedAt || null,
        grade: submission?.grade || null,
        fileUrl: submission?.submissionUrl || null,
      };
    });

    return NextResponse.json(formattedAssignments);
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 