import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { facultyId, courseId } = await request.json()

    if (!facultyId || !courseId) {
      return NextResponse.json({ error: 'Faculty ID and Course ID are required' }, { status: 400 })
    }

    // Check if faculty exists
    const faculty = await prisma.facultyMember.findUnique({
      where: { id: facultyId }
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.facultyCourse.findUnique({
      where: {
        facultyId_courseId: {
          facultyId: faculty.id,
          courseId: course.id
        }
      }
    })

    if (existingAssignment) {
      return NextResponse.json({ error: 'Faculty is already assigned to this course' }, { status: 400 })
    }

    // Create faculty-course assignment
    const assignment = await prisma.facultyCourse.create({
      data: {
        facultyId: faculty.id,
        courseId: course.id
      }
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'ASSIGN',
        entity: 'FACULTY_COURSE',
        details: `Assigned course ${course.name} to faculty ${faculty.name}`
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...assignment,
        facultyName: faculty.name,
        courseName: course.name
      }
    })
  } catch (error: any) {
    console.error('Error assigning course:', error)
    return NextResponse.json({
      error: 'Failed to assign course',
      details: error.message
    }, { status: 500 })
  }
} 