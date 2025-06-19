import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

// Get all students
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        course: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        attendance: true
      },
      orderBy: {
        name: 'asc'
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
    const data = await request.json()
    let { name, email, courseId, semester, rollNumber, password } = data

    // Validate required fields (except rollNumber)
    if (!name || !email || !courseId || !semester || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Auto-generate rollNumber if not provided
    if (!rollNumber || rollNumber.trim() === '') {
      const count = await prisma.student.count()
      const year = new Date().getFullYear()
      rollNumber = `STU${count + 1}-${year}`
    }

    // Check if email already exists
    const existingEmail = await prisma.student.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Check if roll number already exists
    const existingRoll = await prisma.student.findUnique({ where: { rollNumber } })
    if (existingRoll) {
      return NextResponse.json({ error: 'Roll number already exists' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Create student
    const student = await prisma.student.create({
      data: {
        name,
        email,
        courseId,
        currentSemester: parseInt(semester),
        rollNumber,
        password: hashedPassword,
        status: 'ACTIVE'
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
        details: `Created student: ${name}`,
        userId: 'admin',
        userType: 'ADMIN',
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: student 
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

    const student = await prisma.student.delete({
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