import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET() {
  try {
    const studentAdds = await prisma.studentAdd.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        course: true,
      },
    })
    return NextResponse.json(studentAdds)
  } catch (error) {
    console.error('Error fetching student additions:', error)
    return NextResponse.json({ error: 'Failed to fetch student additions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, department, semester, courseId, tokenId, password } = await request.json()
    console.log('Received student addition request:', { name, email, department, semester, courseId, tokenId })

    // Validate required fields
    if (!name || !email || !department || !semester || !courseId || !tokenId || !password) {
      console.log('Missing fields:', { name, email, department, semester, courseId, tokenId, password })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email already exists
    const existingEmail = await prisma.studentAdd.findUnique({ where: { email } })
    if (existingEmail) {
      console.log('Email already exists:', email)
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Check if tokenId already exists
    const existingToken = await prisma.studentAdd.findUnique({ where: { tokenId } })
    if (existingToken) {
      console.log('Token ID already exists:', tokenId)
      return NextResponse.json({ error: 'Token ID already exists' }, { status: 400 })
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      console.log('Course not found:', courseId)
      return NextResponse.json({ error: 'Course not found' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Create student addition record
    const studentAdd = await prisma.studentAdd.create({
      data: {
        name,
        email,
        department,
        semester: parseInt(semester.toString(), 10),
        courseId,
        tokenId,
        password: hashedPassword,
      },
      include: {
        course: true,
      },
    })

    console.log('Student addition successful:', studentAdd.id)
    return NextResponse.json({ 
      success: true, 
      data: {
        id: studentAdd.id,
        name: studentAdd.name,
        email: studentAdd.email,
        department: studentAdd.department,
        semester: studentAdd.semester,
        courseId: studentAdd.courseId,
        course: studentAdd.course,
        tokenId: studentAdd.tokenId,
      }
    })
  } catch (error: any) {
    console.error('Error adding student:', error)
    return NextResponse.json({ 
      error: 'Failed to add student', 
      details: error.message,
      code: error.code 
    }, { status: 500 })
  }
} 