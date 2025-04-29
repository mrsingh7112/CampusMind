import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Total students
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT', approved: true } })

    // New enrollments in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newEnrollments = await prisma.user.count({
      where: {
        role: 'STUDENT',
        approved: true,
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    return NextResponse.json([
      { label: 'Total Students', value: totalStudents },
      { label: 'New Enrollments', value: newEnrollments, change: '+0%', trend: 'up' },
    ])
  } catch (error) {
    console.error('Error fetching student stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student stats' },
      { status: 500 }
    )
  }
} 