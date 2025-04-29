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

    // Validate the request
    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 })
    }

    if (type === 'department') {
      // Validate department name
      if (!name || typeof name !== 'string') {
        return NextResponse.json({ error: 'Department name is required' }, { status: 400 })
      }

      // Generate department code from name (e.g., "School of Management" -> "SOM")
      const code = name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()

      // Check if department already exists
      const existingDepartment = await prisma.department.findFirst({
        where: {
          OR: [
            { name: { equals: name, mode: 'insensitive' } },
            { code: code }
          ]
        }
      })

      if (existingDepartment) {
        return NextResponse.json({ 
          error: existingDepartment.name === name ? 'Department already exists' : 'Department code already exists' 
        }, { status: 400 })
      }

      // Create department
      const createdDepartment = await prisma.department.create({ 
        data: { 
          name,
          code,
          status: 'ACTIVE'
        } 
      })

      // Create courses and subjects if provided
      if (Array.isArray(courses)) {
        for (const course of courses) {
          if (!course.name) {
            continue // Skip if course name is missing
          }

          try {
            const courseCode = `${code}-${Math.floor(Math.random() * 1000)}`
            const createdCourse = await prisma.course.create({
              data: {
                name: course.name,
                code: courseCode,
                departmentId: createdDepartment.id,
                status: 'ACTIVE'
              },
            })

            // Add subjects if they exist
            if (Array.isArray(course.subjects)) {
              for (const subjGroup of course.subjects) {
                if (subjGroup.semester && Array.isArray(subjGroup.subjects)) {
                  for (const subjectName of subjGroup.subjects) {
                    if (subjectName) {
                      const subjectCode = `${courseCode}-${subjGroup.semester}-${Math.floor(Math.random() * 100)}`
                      await prisma.subject.create({
                        data: {
                          name: subjectName,
                          code: subjectCode,
                          semester: subjGroup.semester,
                          courseId: createdCourse.id,
                          status: 'ACTIVE'
                        },
                      })
                    }
                  }
                }
              }
            }
          } catch (courseError) {
            console.error('Error creating course:', courseError)
            // Continue with other courses even if one fails
          }
        }
      }

      return NextResponse.json({ 
        success: true, 
        created: createdDepartment 
      })
    } else if (type === 'course') {
      if (!departmentId || !name) {
        return NextResponse.json({ error: 'Department ID and course name are required' }, { status: 400 })
      }

      const department = await prisma.department.findUnique({ where: { id: departmentId } })
      if (!department) {
        return NextResponse.json({ error: 'Department not found' }, { status: 404 })
      }

      const created = await prisma.course.create({
        data: {
          name,
          code: `${department.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
          departmentId,
        },
      })
      return NextResponse.json({ success: true, created })
    } else if (type === 'subject') {
      if (!courseId || !name || !semester) {
        return NextResponse.json({ error: 'Course ID, subject name, and semester are required' }, { status: 400 })
      }

      const created = await prisma.subject.create({ 
        data: { name, semester, courseId } 
      })
      return NextResponse.json({ success: true, created })
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error adding:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to add',
      details: error
    }, { status: 500 })
  }
} 