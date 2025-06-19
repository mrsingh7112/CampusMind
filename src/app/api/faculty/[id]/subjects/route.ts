import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all subjects assigned to a faculty (with course/semester info)
export async function GET(request, { params }) {
  const facultyId = params.id;
  const assignments = await prisma.facultySubject.findMany({
    where: { facultyId },
    include: {
      subject: {
        include: { course: true }
      }
    }
  });
  return NextResponse.json(assignments.map(a => ({
    id: a.subject.id,
    name: a.subject.name,
    code: a.subject.code,
    semester: a.subject.semester,
    course: a.subject.course,
    assignedAt: a.assignedAt
  })));
}

// POST: Assign subjects to a faculty (expects { subjectIds: number[] })
export async function POST(request, { params }) {
  const facultyId = params.id;
  const { subjectIds } = await request.json();
  if (!Array.isArray(subjectIds) || subjectIds.length < 5 || subjectIds.length > 8) {
    return NextResponse.json({ error: 'Faculty must be assigned 5 to 8 subjects.' }, { status: 400 });
  }
  // Get faculty's assigned courses
  const facultyCourses = await prisma.facultyCourse.findMany({ where: { facultyId } });
  const allowedCourseIds = facultyCourses.map(fc => fc.courseId);
  // Get all subjects from those courses
  const allowedSubjects = await prisma.subject.findMany({ where: { courseId: { in: allowedCourseIds } } });
  const allowedSubjectIds = allowedSubjects.map(s => s.id);
  // Check all subjectIds are allowed
  if (!subjectIds.every(id => allowedSubjectIds.includes(id))) {
    return NextResponse.json({ error: 'One or more subjects are not in assigned courses.' }, { status: 400 });
  }
  // Remove existing assignments
  await prisma.facultySubject.deleteMany({ where: { facultyId } });
  // Assign new subjects
  await prisma.facultySubject.createMany({
    data: subjectIds.map(subjectId => ({ facultyId, subjectId }))
  });
  return NextResponse.json({ success: true });
}

// DELETE: Unassign a subject (expects { subjectId })
export async function DELETE(request, { params }) {
  const facultyId = params.id;
  const { subjectId } = await request.json();
  await prisma.facultySubject.deleteMany({ where: { facultyId, subjectId } });
  return NextResponse.json({ success: true });
} 