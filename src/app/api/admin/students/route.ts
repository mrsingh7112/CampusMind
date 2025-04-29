import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isNew = searchParams.get('new') === 'true'
    
    const students = await prisma.studentMember.findMany({
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
    const { name, email, courseId, semester, tokenId, password } = await request.json()

    // Validate required fields
    if (!name || !email || !courseId || !semester || !tokenId || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the course to get its department
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId.toString(), 10) },
      include: { department: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Create the student
    const student = await prisma.studentMember.create({
      data: {
        name,
        email,
        department: course.department.name,
        semester: parseInt(semester.toString(), 10),
        courseId: parseInt(courseId.toString(), 10),
        tokenId,
        password,
        status: 'ACTIVE'
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
  } catch (error) {
    console.error('Error adding student:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email or Token ID already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to add student' }, { status: 500 })
  }
}