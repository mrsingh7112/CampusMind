import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  const subjectId = parseInt(params.subjectId, 10)
  if (!subjectId) {
    return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 })
  }
  // Get the subject to find its course and semester
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }
  // Get all students in the same course and semester
  const students = await prisma.student.findMany({
    where: {
      courseId: subject.courseId,
      currentSemester: subject.semester,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      rollNumber: true,
      email: true,
    }
  })
  return NextResponse.json(students)
} 