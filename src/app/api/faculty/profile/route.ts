import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const faculty = await prisma.user.findUnique({
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

    const updatedFaculty = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name: data.name,
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