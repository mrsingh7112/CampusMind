import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get a single faculty member
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: params.id },
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

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    return NextResponse.json(faculty)
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json({ error: 'Failed to fetch faculty' }, { status: 500 })
  }
}

// Update a faculty member
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, department, position, employeeId, phoneNumber, status } = body

    // Validate required fields
    if (!name || !email || !department || !position || !employeeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email is already taken by another faculty member
    const existingFaculty = await prisma.faculty.findFirst({
      where: {
        email,
        id: { not: params.id }
      }
    })

    if (existingFaculty) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Update faculty member
    const faculty = await prisma.faculty.update({
      where: { id: params.id },
      data: {
        name,
        email,
        department,
        position,
        employeeId,
        phoneNumber,
        ...(status && { status })
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        entity: 'FACULTY',
        details: `Updated faculty member: ${name}`,
        userId: 'admin',
        userType: 'ADMIN'
      }
    })

    return NextResponse.json(faculty)
  } catch (error) {
    console.error('Error updating faculty:', error)
    return NextResponse.json({ error: 'Failed to update faculty' }, { status: 500 })
  }
}

// Delete a faculty member
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const faculty = await prisma.faculty.delete({
      where: { id: params.id }
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