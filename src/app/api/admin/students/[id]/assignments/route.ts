import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { studentId: params.id },
      include: { assignment: true },
      orderBy: { submittedAt: 'desc' },
    })
    const assignments = submissions.map(s => ({
      id: s.assignment.id,
      title: s.assignment.title,
      status: s.status,
      grade: s.grade,
    }))
    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
} 