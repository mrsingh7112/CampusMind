import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Total students
    const totalStudents = await prisma.student.count()
    
    // Active students
    const activeStudents = await prisma.student.count({
      where: { status: 'ACTIVE' }
    })

    // New enrollments in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newEnrollments = await prisma.student.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    // Department-wise distribution
    const departmentStats = await prisma.student.groupBy({
      by: ['courseId'],
      _count: {
        _all: true
      }
    })

    // Fetch course and department data for the grouped results
    const courseIds = departmentStats.map(d => d.courseId)
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds }
      },
      include: {
        department: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    // Map the results together
    const departmentStatsWithDetails = departmentStats.map(d => {
      const course = courses.find(c => c.id === d.courseId)
      return {
        department: course?.department?.name || 'Unknown',
        code: course?.department?.code || 'UNK',
        count: d._count._all
      }
    })

    // Semester-wise distribution
    const semesterStats = await prisma.student.groupBy({
      by: ['currentSemester'],
      _count: {
        _all: true
      }
    })

    return NextResponse.json({
      totalStudents,
      activeStudents,
      newEnrollments,
      departmentStats: departmentStatsWithDetails,
      semesterStats: semesterStats.map(s => ({
        semester: s.currentSemester,
        count: s._count._all
      }))
    })
  } catch (error) {
    console.error('Error fetching student stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student stats' },
      { status: 500 }
    )
  }
} 