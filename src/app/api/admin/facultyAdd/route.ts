import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function GET() {
  try {
    const facultyAdds = await prisma.facultyAdd.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(facultyAdds)
  } catch (error) {
    console.error('Error fetching faculty additions:', error)
    return NextResponse.json({ error: 'Failed to fetch faculty additions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, department, position, tokenId, password } = await request.json()
    console.log('Received faculty addition request:', { name, email, department, position, tokenId })

    // Validate required fields
    if (!name || !email || !department || !position || !tokenId || !password) {
      console.log('Missing fields:', { name, email, department, position, tokenId, password })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email already exists
    const existingEmail = await prisma.facultyAdd.findUnique({ where: { email } })
    if (existingEmail) {
      console.log('Email already exists:', email)
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Check if tokenId already exists
    const existingToken = await prisma.facultyAdd.findUnique({ where: { tokenId } })
    if (existingToken) {
      console.log('Token ID already exists:', tokenId)
      return NextResponse.json({ error: 'Token ID already exists' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

    // Create faculty addition record
    const facultyAdd = await prisma.facultyAdd.create({
      data: {
        name,
        email,
        department,
        position,
        tokenId,
        password: hashedPassword,
      },
    })

    console.log('Faculty addition successful:', facultyAdd.id)
    return NextResponse.json({ 
      success: true, 
      data: {
        id: facultyAdd.id,
        name: facultyAdd.name,
        email: facultyAdd.email,
        department: facultyAdd.department,
        position: facultyAdd.position,
        tokenId: facultyAdd.tokenId,
      }
    })
  } catch (error: any) {
    console.error('Error adding faculty:', error)
    return NextResponse.json({ 
      error: 'Failed to add faculty', 
      details: error.message,
      code: error.code 
    }, { status: 500 })
  }
} 