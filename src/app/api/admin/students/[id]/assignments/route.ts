import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!prisma) throw new Error('Prisma client is not initialized')
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
    return NextResponse.json(Array.isArray(assignments) ? assignments : [])
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
} 