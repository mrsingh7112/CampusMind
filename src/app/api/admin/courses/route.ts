import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')

    if (departmentId) {
      // Get courses for a specific department
      const courses = await prisma.course.findMany({
        where: {
          departmentId: parseInt(departmentId)
        },
        select: {
          id: true,
          name: true,
          code: true,
          subjects: {
            select: {
              id: true,
              name: true,
              semester: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
      return NextResponse.json(courses)
    } else {
      // Get all courses
      const courses = await prisma.course.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          department: {
            select: {
              id: true,
              name: true
            }
          },
          subjects: {
            select: {
              id: true,
              name: true,
              semester: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
      return NextResponse.json(courses)
    }
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}