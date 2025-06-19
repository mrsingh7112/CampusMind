import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

console.log('[Faculty Classes API] Route called');

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all subjects assigned to this faculty
  const facultySubjects = await prisma.facultySubject.findMany({
    where: { facultyId: session.user.id },
    include: {
      subject: {
        include: {
          course: true
        }
      }
    }
  });

  // Map to the format expected by the dashboard
  const classes = await Promise.all(
    facultySubjects.map(async (fs) => {
      // Count students for this subject's course and semester
      const studentCount = await prisma.student.count({
        where: {
          courseId: fs.subject.courseId,
          currentSemester: fs.subject.semester
        }
      });
      return {
        id: fs.subject.id,
        name: fs.subject.name,
        code: fs.subject.code,
        semester: fs.subject.semester,
        course: fs.subject.course.name,
        studentCount,
        // Optionally, you can add timetable info if you want to show it
      };
    })
  );

  return NextResponse.json(classes);
} 