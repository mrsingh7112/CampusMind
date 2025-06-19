import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs';

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const subjectId = Number(formData.get('subjectId'))
  const title = formData.get('title')
  const description = formData.get('description')
  const dueDate = formData.get('dueDate')
  const file = formData.get('file')

  if (!subjectId || !title || !description || !dueDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Find subject and course
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: { course: true }
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  let fileUrl = null
  if (file && typeof file === 'object' && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'assignments')
    await writeFile(
      path.join(uploadDir, file.name),
      buffer
    )
    fileUrl = `/uploads/assignments/${file.name}`
  }

  // Create assignment
  const assignment = await prisma.assignment.create({
    data: {
      title,
      description,
      dueDate: new Date(dueDate),
      facultyId: session.user.id,
      courseId: subject.courseId,
      subjectId: subject.id,
      status: 'sent',
      ...(fileUrl ? { description: `${description}\n\n[Download PDF](${fileUrl})` } : {})
    }
  })

  // Notify all students of this subject's course
  const students = await prisma.student.findMany({
    where: {
      courseId: subject.courseId,
      currentSemester: subject.semester
    }
  })
  await Promise.all(students.map(student =>
    prisma.notification.create({
      data: {
        title: 'New Assignment',
        message: `New assignment "${title}" has been posted for ${subject.name}. Due: ${new Date(dueDate).toLocaleDateString()}`,
        recipientId: student.id,
        recipientType: 'STUDENT',
        fileUrl: fileUrl || undefined
      }
    })
  ))

  return NextResponse.json({ success: true, assignment })
} 