import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        department: true,
        position: true,
        avatar: true
      }
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    return NextResponse.json(faculty)
  } catch (error) {
    console.error('Error fetching faculty profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const updatedFaculty = await prisma.faculty.update({
      where: {
        id: session.user.id
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        department: data.department,
        position: data.position
      }
    })

    return NextResponse.json(updatedFaculty)
  } catch (error) {
    console.error('Error updating faculty profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const updatedFaculty = await prisma.faculty.update({
      where: {
        id: session.user.id
      },
      data: {
        password: hashedPassword
      }
    })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error updating faculty password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 