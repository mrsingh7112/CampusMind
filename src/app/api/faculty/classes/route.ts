import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'FACULTY') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get all classes taught by the faculty member
    const classes = await prisma.class.findMany({
      where: {
        facultyId: session.user.id
      },
      select: {
        id: true,
        name: true,
        code: true,
        semester: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to include the student count
    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      code: cls.code,
      semester: cls.semester,
      studentCount: cls._count.enrollments
    }))

    return NextResponse.json(formattedClasses)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 