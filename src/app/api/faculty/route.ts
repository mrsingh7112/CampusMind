import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

// Get all faculty members
export async function GET() {
  try {
    const faculty = await prisma.facultyMember.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'READ',
        entity: 'FACULTY',
        details: 'Retrieved faculty list'
      }
    })
    
    return NextResponse.json(faculty)
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json({ error: 'Failed to fetch faculty' }, { status: 500 })
  }
}

// Add new faculty member
export async function POST(request: Request) {
  try {
    const { name, email, department, position, tokenId, password } = await request.json()

    // Validate required fields
    if (!name || !email || !department || !position || !tokenId || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for existing email
    const existingEmail = await prisma.facultyMember.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Check for existing tokenId
    const existingToken = await prisma.facultyMember.findUnique({ where: { tokenId } })
    if (existingToken) {
      return NextResponse.json({ error: 'Token ID already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create faculty member
    const faculty = await prisma.facultyMember.create({
      data: {
        name,
        email,
        department,
        position,
        tokenId,
        password: hashedPassword,
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        entity: 'FACULTY',
        details: `Created faculty member: ${name}`
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: faculty.id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        position: faculty.position,
        tokenId: faculty.tokenId
      }
    })
  } catch (error: any) {
    console.error('Error creating faculty:', error)
    return NextResponse.json({
      error: 'Failed to create faculty',
      details: error.message
    }, { status: 500 })
  }
}

// Delete faculty member
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 })
    }

    const faculty = await prisma.facultyMember.delete({
      where: { id }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DELETE',
        entity: 'FACULTY',
        details: `Deleted faculty member: ${faculty.name}`
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting faculty:', error)
    return NextResponse.json({ error: 'Failed to delete faculty' }, { status: 500 })
  }
} 