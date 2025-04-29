import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const results = await prisma.result.findMany({
      where: { studentId: params.id },
      include: { course: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { course, marks, grade, examType } = await request.json()
    // Find course by name (or code)
    const courseObj = await prisma.course.findFirst({ where: { name: course } })
    if (!courseObj) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    const result = await prisma.result.create({
      data: {
        courseId: courseObj.id,
        studentId: params.id,
        marks: parseFloat(marks),
        grade,
        examType,
        semester: 1, // You can update this as needed
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error adding result:', error)
    return NextResponse.json(
      { error: 'Failed to add result' },
      { status: 500 }
    )
  }
} 