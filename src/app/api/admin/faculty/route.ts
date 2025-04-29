import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET endpoint to fetch faculty
export async function GET() {
  try {
    const faculty = await prisma.facultyMember.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    })
    return NextResponse.json(faculty)
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
    const data = await request.json()
    const { name, email, department, position, tokenId, password } = data

    // Validate required fields
    if (!name || !email || !tokenId || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.facultyMember.findUnique({
      where: { email }
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Check if token ID already exists
    const existingToken = await prisma.facultyMember.findUnique({
      where: { tokenId }
    })
    if (existingToken) {
      return NextResponse.json(
        { error: 'Token ID already exists' },
        { status: 400 }
      )
    }

    const faculty = await prisma.facultyMember.create({
      data: {
        name,
        email,
        department,
        position,
        tokenId,
        password,
        status: 'ACTIVE'
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
    const data = await request.json()
    const { id, status } = data

    if (!id) {
      return NextResponse.json(
        { error: 'Faculty ID is required' },
        { status: 400 }
      )
    }

    const faculty = await prisma.facultyMember.update({
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Faculty ID is required' },
        { status: 400 }
      )
    }

    await prisma.facultyMember.delete({
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