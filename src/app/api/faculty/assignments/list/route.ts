import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const assignments = await prisma.assignment.findMany({
    where: { facultyId: session.user.id },
    include: { subject: true },
    orderBy: { dueDate: 'desc' }
  })
  return NextResponse.json(assignments)
} 