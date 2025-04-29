import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

// Get all students
export async function GET() {
  try {
    const students = await prisma.studentMember.findMany({
      orderBy: { createdAt: 'desc' },
      include: { course: true }
    })
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'READ',
        entity: 'STUDENT',
        details: 'Retrieved student list'
      }
    })
    
    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

// Add new student
export async function POST(request: Request) {
  try {
    const { name, email, department, semester, courseId, tokenId, password } = await request.json()

    // Validate required fields
    if (!name || !email || !department || !semester || !courseId || !tokenId || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for existing email
    const existingEmail = await prisma.studentMember.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Check for existing tokenId
    const existingToken = await prisma.studentMember.findUnique({ where: { tokenId } })
    if (existingToken) {
      return NextResponse.json({ error: 'Token ID already exists' }, { status: 400 })
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create student
    const student = await prisma.studentMember.create({
      data: {
        name,
        email,
        department,
        semester: parseInt(semester.toString()),
        courseId: parseInt(courseId.toString()),
        tokenId,
        password: hashedPassword,
      },
      include: {
        course: true
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        entity: 'STUDENT',
        details: `Created student: ${name}`
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        department: student.department,
        semester: student.semester,
        courseId: student.courseId,
        course: student.course,
        tokenId: student.tokenId
      }
    })
  } catch (error: any) {
    console.error('Error creating student:', error)
    return NextResponse.json({
      error: 'Failed to create student',
      details: error.message
    }, { status: 500 })
  }
}

// Delete student
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 })
    }

    const student = await prisma.studentMember.delete({
      where: { id }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DELETE',
        entity: 'STUDENT',
        details: `Deleted student: ${student.name}`
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
} 