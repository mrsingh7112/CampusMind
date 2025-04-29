import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        facultyId: session.user.id,
      },
      include: {
        course: true,
        submissions: {
          include: {
            student: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const courseId = formData.get('courseId') as string
    const dueDate = formData.get('dueDate') as string
    const files = formData.getAll('files') as File[]

    // Validate required fields
    if (!title || !description || !courseId || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        courseId,
        dueDate: new Date(dueDate),
        facultyId: session.user.id,
      },
    })

    // Handle file uploads
    if (files.length > 0) {
      // TODO: Implement file upload to cloud storage
      // For now, we'll just log the files
      console.log('Files to upload:', files.map(f => f.name))
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
} 