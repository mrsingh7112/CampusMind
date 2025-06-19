import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET endpoint to fetch faculty
export async function GET() {
  try {
    const faculty = await prisma.faculty.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        department: true,
        courses: {
          include: {
            course: true
          }
        },
        attendance: true,
        facultySubjects: {
          include: {
            subject: {
              include: { course: true }
            }
          }
        }
      },
    })
    // Map courses to assignedCourses and subjects to assignedSubjects for frontend compatibility
    const result = faculty.map(f => ({
      ...f,
      assignedCourses: f.courses,
      assignedSubjects: f.facultySubjects.map(fs => ({
        id: fs.subject.id,
        name: fs.subject.name,
        code: fs.subject.code,
        semester: fs.subject.semester,
        course: fs.subject.course,
        assignedAt: fs.assignedAt
      }))
    }))
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty data' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN' || !(session.user as any).isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json()
    const { name, email, department, position, employeeId, password, phoneNumber } = data

    // Validate required fields
    if (!name || !email || !employeeId || !password || !department || !position) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.faculty.findUnique({
      where: { email }
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Check if employeeId already exists
    const existingEmployee = await prisma.faculty.findUnique({
      where: { employeeId }
    })
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      )
    }

    // Find department by name
    const departmentRecord = await prisma.department.findFirst({
      where: { name: department }
    })

    if (!departmentRecord) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    const faculty = await prisma.faculty.create({
      data: {
        name,
        email,
        departmentId: departmentRecord.id,
        position,
        employeeId,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        status: 'ACTIVE',
      },
      include: {
        department: true
      }
    })

    return NextResponse.json(faculty)
  } catch (error) {
    console.error('Error creating faculty:', error)
    return NextResponse.json(
      { error: 'Failed to create faculty member' },
      { status: 500 }
    )
  }
}

// PATCH endpoint to update faculty status
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN' || !(session.user as any).isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json()
    const { id, status } = data

    if (!id) {
      return NextResponse.json(
        { error: 'Faculty ID is required' },
        { status: 400 }
      )
    }

    const faculty = await prisma.faculty.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json(faculty)
  } catch (error) {
    console.error('Error updating faculty:', error)
    return NextResponse.json(
      { error: 'Failed to update faculty member' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN' || !(session.user as any).isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Faculty ID is required' },
        { status: 400 }
      )
    }

    await prisma.faculty.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting faculty:', error)
    return NextResponse.json(
      { error: 'Failed to delete faculty member' },
      { status: 500 }
    )
  }
} 