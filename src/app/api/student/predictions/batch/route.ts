import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { predictStudentPerformance } from '@/lib/ai/predictions'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courses } = await request.json()
    if (!Array.isArray(courses)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    // Process all predictions in parallel
    const predictions = await Promise.all(
      courses.map(course => 
        predictStudentPerformance({
          courseId: course.courseId,
          assignments: course.assignments,
          attendance: course.attendance,
          previousGrades: course.previousGrades,
        }).catch(error => {
          console.error(`Error predicting performance for course ${course.courseId}:`, error)
          return null
        })
      )
    )

    return NextResponse.json(predictions)
  } catch (error) {
    console.error('Error processing batch predictions:', error)
    return NextResponse.json(
      { error: 'Failed to process predictions' },
      { status: 500 }
    )
  }
} 