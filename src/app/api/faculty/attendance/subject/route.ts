import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const subjectId = Number(searchParams.get('subjectId'))
  const date = searchParams.get('date')

  if (!subjectId || !date) {
    return NextResponse.json({ error: 'Missing subjectId or date' }, { status: 400 })
  }

  // Get subject details to find total students in the course/semester
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { courseId: true, semester: true }
  });

  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
  }

  // Count total students for this subject's course and semester
  const totalStudents = await prisma.student.count({
    where: {
      courseId: subject.courseId,
      currentSemester: subject.semester
    }
  });

  // Count present students for this subject on this date
  const presentStudents = await prisma.studentAttendance.count({
    where: {
      subjectId,
      date: new Date(date),
      status: 'PRESENT'
    }
  })

  console.log('[Attendance API] subjectId:', subjectId, 'date:', date, 'presentStudents:', presentStudents, 'totalStudents:', totalStudents);

  return NextResponse.json({ presentStudents, totalStudents })
} 