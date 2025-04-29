import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all departments with courses and subjects
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        courses: {
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
          }
        },
        _count: {
          select: {
            courses: true
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}

// PATCH: Rename department, course, or subject
export async function PATCH(request: Request) {
  try {
    const { type, id, name } = await request.json()
    let updated
    if (type === 'department') {
      updated = await prisma.department.update({ where: { id }, data: { name } })
    } else if (type === 'course') {
      updated = await prisma.course.update({ where: { id }, data: { name } })
    } else if (type === 'subject') {
      updated = await prisma.subject.update({ where: { id }, data: { name } })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error('Error renaming:', error)
    return NextResponse.json({ error: 'Failed to rename' }, { status: 500 })
  }
}

// DELETE: Remove department, course, or subject
export async function DELETE(request: Request) {
  try {
    const { type, id } = await request.json()
    if (type === 'department') {
      await prisma.department.delete({ where: { id } })
    } else if (type === 'course') {
      await prisma.course.delete({ where: { id } })
    } else if (type === 'subject') {
      await prisma.subject.delete({ where: { id } })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

// POST: Add course or subject
export async function POST(request: Request) {
  try {
    const { type, departmentId, courseId, name, semester, courses } = await request.json()
    let created
    if (type === 'department') {
      // Create department
      const createdDepartment = await prisma.department.create({ data: { name } })
      // Create courses and subjects if provided
      if (Array.isArray(courses)) {
        for (const course of courses) {
          const createdCourse = await prisma.course.create({
            data: {
              name: course.name,
              code: `${createdDepartment.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
              departmentId: createdDepartment.id,
            },
          })
          if (Array.isArray(course.subjects)) {
            for (const subjGroup of course.subjects) {
              if (Array.isArray(subjGroup.subjects)) {
                for (const subjectName of subjGroup.subjects) {
                  await prisma.subject.create({
                    data: {
                      name: subjectName,
                      semester: subjGroup.semester,
                      courseId: createdCourse.id,
                    },
                  })
                }
              }
            }
          }
        }
      }
      created = createdDepartment
    } else if (type === 'course') {
      const department = await prisma.department.findUnique({ where: { id: departmentId } })
      if (!department) {
        return NextResponse.json({ error: 'Department not found' }, { status: 404 })
      }
      created = await prisma.course.create({
        data: {
          name,
          code: `${department.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
          departmentId,
        },
      })
    } else if (type === 'subject') {
      created = await prisma.subject.create({ data: { name, semester, courseId } })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    return NextResponse.json({ success: true, created })
  } catch (error) {
    console.error('Error adding:', error)
    return NextResponse.json({ error: 'Failed to add' }, { status: 500 })
  }
} 