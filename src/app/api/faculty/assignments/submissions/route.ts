import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'FACULTY' && session.user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing assignment id' }, { status: 400 })

  const assignment = await prisma.assignment.findUnique({ where: { id } })
  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (session.user.role !== 'ADMIN' && assignment.facultyId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId: id },
    include: { student: true }
  })
  return NextResponse.json(submissions)
} 