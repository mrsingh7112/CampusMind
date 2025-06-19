import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id, 10)
    // Check for enrolled students
    const students = await prisma.student.findMany({ where: { courseId } })
    if (students.length > 0) {
      return NextResponse.json({ error: 'Cannot delete course: students are enrolled.' }, { status: 400 })
    }
    // Check for assigned subjects
    const subjects = await prisma.subject.findMany({ where: { courseId } })
    if (subjects.length > 0) {
      return NextResponse.json({ error: 'Cannot delete course: subjects are assigned.' }, { status: 400 })
    }
    // Delete the course
    await prisma.course.delete({ where: { id: courseId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json({ error: 'Failed to delete course.' }, { status: 500 })
  }
} 