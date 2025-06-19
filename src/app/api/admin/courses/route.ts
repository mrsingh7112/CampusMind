import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')

    if (departmentId) {
      // Convert departmentId to integer
      const deptIdInt = parseInt(departmentId, 10)
      // Get courses for a specific department
      const courses = await prisma.course.findMany({
        where: {
          departmentId: deptIdInt
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
          },
          students: {
            select: { id: true }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
      // Add studentsCount to each course
      const coursesWithCount = courses.map(c => ({ ...c, studentsCount: c.students.length, students: undefined }))
      return NextResponse.json(coursesWithCount)
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
          },
          students: {
            select: { id: true }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
      // Add studentsCount to each course
      const coursesWithCount = courses.map(c => ({ ...c, studentsCount: c.students.length, students: undefined }))
      return NextResponse.json(coursesWithCount)
    }
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { name, code, departmentId } = await request.json();
    if (!name || !code || !departmentId) {
      return NextResponse.json({ error: 'Name, code, and departmentId are required.' }, { status: 400 });
    }
    // Check for unique code
    const existing = await prisma.course.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: 'Course code must be unique.' }, { status: 400 });
    }
    // Create the course
    const created = await prisma.course.create({
      data: {
        name,
        code,
        departmentId: typeof departmentId === 'string' ? parseInt(departmentId, 10) : departmentId,
        status: 'ACTIVE',
      },
    });
    return NextResponse.json({ success: true, course: created });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course.' }, { status: 500 });
  }
}