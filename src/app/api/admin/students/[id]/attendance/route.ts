import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attendance = await prisma.attendance.findMany({
      where: { studentId: params.id },
      include: { subject: { select: { name: true } } },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
} 