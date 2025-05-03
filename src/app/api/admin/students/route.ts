import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isNew = searchParams.get('new') === 'true'
    
    const students = await prisma.student.findMany({
      where: isNew ? {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      } : {},
      include: {
        course: {
          include: {
            department: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received student data:', body)
    const { name, email, courseId, semester, rollNumber, password, phoneNumber } = body

    // Validate required fields
    if (!name || !email || !courseId || !semester || !rollNumber || !password) {
      console.log('Missing fields:', { name, email, courseId, semester, rollNumber, password })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the course to get its department
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId.toString(), 10) },
      include: { department: true }
    })

    if (!course) {
      console.log('Course not found:', courseId)
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check for existing email
    const existingEmail = await prisma.student.findUnique({ where: { email } })
    if (existingEmail) {
      console.log('Email already exists:', email)
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Check for existing rollNumber
    const existingRoll = await prisma.student.findUnique({ where: { rollNumber } })
    if (existingRoll) {
      console.log('Roll Number already exists:', rollNumber)
      return NextResponse.json({ error: 'Roll Number already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create the student
    const student = await prisma.student.create({
      data: {
        name,
        email,
        semester: parseInt(semester.toString(), 10),
        courseId: parseInt(courseId.toString(), 10),
        rollNumber,
        password: hashedPassword,
        phoneNumber: phoneNumber || null,
        status: 'ACTIVE',
      },
      include: {
        course: {
          include: {
            department: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: student })
  } catch (error: any) {
    console.error('Error adding student:', error)
    return NextResponse.json({ error: error.message || 'Failed to add student', details: error }, { status: 500 })
  }
}

// PATCH: Update student status and deactivation period
export async function PATCH(request: Request) {
  try {
    const { id, status, deactivatedFrom, deactivatedTo } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Find the student first
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check for rustication (3 deactivations)
    if (status === 'INACTIVE' && ((student.deactivationCount ?? 0) + 1) >= 3) {
      // Delete related attendance
      await prisma.studentAttendance.deleteMany({ where: { studentId: id } });
      // Delete the student
      await prisma.student.delete({ where: { id } });
      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: 'admin',
          userType: 'ADMIN',
          action: 'RUSTICATE',
          entity: 'STUDENT',
          details: `Student rusticated and deleted after 3 deactivations: ${student.name}`,
        },
      });
      return NextResponse.json({ success: true, rusticated: true });
    }

    // Normal update
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        status,
        ...(status === 'INACTIVE' ? {
          deactivatedFrom: deactivatedFrom ? new Date(deactivatedFrom) : new Date(),
          deactivatedTo: deactivatedTo ? new Date(deactivatedTo) : null,
          deactivationCount: { increment: 1 }
        } : {
          deactivatedFrom: null,
          deactivatedTo: null,
          deactivationCount: 0
        })
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: 'admin',
        userType: 'ADMIN',
        action: 'UPDATE',
        entity: 'STUDENT',
        details: `Updated student status: ${student.name} to ${status}`,
      },
    });

    return NextResponse.json({ success: true, data: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}