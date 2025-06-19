import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const months = parseInt(url.searchParams.get('months') || '6')
    const departmentId = url.searchParams.get('department')
    const courseId = url.searchParams.get('course')

    // Calculate date range
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    
    // Base query filters
    const baseFilters = {
      date: {
        gte: startDate
      }
    }

    // Department and course filters
    const departmentFilter = departmentId && departmentId !== 'all' ? { id: parseInt(departmentId) } : {}
    const courseFilter = courseId && courseId !== 'all' ? { id: parseInt(courseId) } : {}

    // Fetch attendance records with filters
    const attendanceRecords = await prisma.studentAttendance.findMany({
      where: {
        ...baseFilters,
        student: {
          course: {
            ...courseFilter,
            department: departmentFilter
          }
        }
      },
      include: {
        student: {
          include: {
            course: true
          }
        }
      }
    })

    // Group attendance by month with trend analysis
    const monthlyAttendance = attendanceRecords.reduce((acc: any, record) => {
      const month = record.date.toLocaleString('default', { month: 'short' })
      if (!acc[month]) {
        acc[month] = { present: 0, total: 0 }
      }
      acc[month].total++
      if (record.status === 'PRESENT') {
        acc[month].present++
      }
      return acc
    }, {})

    const attendanceTrends = {
      labels: Object.keys(monthlyAttendance),
      data: Object.values(monthlyAttendance).map((v: any) => (v.present / v.total * 100).toFixed(2)),
      trend: calculateTrend(Object.values(monthlyAttendance).map((v: any) => (v.present / v.total * 100)))
    }

    // Fetch department statistics with advanced metrics
    const departments = await prisma.department.findMany({
      where: departmentFilter,
      include: {
        courses: {
          where: courseFilter,
          include: {
            students: {
              include: {
                attendance: {
                  where: baseFilters
                }
              }
            },
            facultyCourses: {
              include: {
                faculty: true
              }
            },
            subjects: true
          }
        }
      }
    })

    const departmentStats = {
      labels: departments.map(d => d.name),
      students: departments.map(d => 
        d.courses.reduce((sum, course) => sum + course.students.length, 0)
      ),
      faculty: departments.map(d => 
        new Set(d.courses.flatMap(c => c.facultyCourses.map(fc => fc.faculty.id))).size
      ),
      avgAttendance: departments.map(d => {
        const deptAttendance = d.courses.flatMap(c => 
          c.students.flatMap(s => s.attendance)
        )
        return deptAttendance.length > 0
          ? (deptAttendance.filter(a => a.status === 'PRESENT').length / deptAttendance.length * 100).toFixed(2)
          : 0
      }),
      subjectsPerCourse: departments.map(d => 
        d.courses.reduce((sum, c) => sum + c.subjects.length, 0) / (d.courses.length || 1)
      )
    }

    // Calculate performance distribution with risk analysis
    const students = await prisma.student.findMany({
      where: {
        course: {
          ...courseFilter,
          department: departmentFilter
        }
      },
      include: {
        attendance: {
          where: baseFilters
        },
        course: {
          include: {
            subjects: true
          }
        }
      }
    })

    const performanceMetrics = students.map(student => {
      const attendancePercentage = student.attendance.length > 0
        ? (student.attendance.filter(a => a.status === 'PRESENT').length / student.attendance.length * 100)
        : 0

      const recentAttendance = student.attendance
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
      
      const recentTrend = recentAttendance.length > 0
        ? (recentAttendance.filter(a => a.status === 'PRESENT').length / recentAttendance.length * 100)
        : 0

      return {
        attendancePercentage,
        recentTrend,
        riskScore: calculateRiskScore(attendancePercentage, recentTrend)
      }
    })

    const performanceDistribution = [
      performanceMetrics.filter(p => p.riskScore >= 8).length,  // Good
      performanceMetrics.filter(p => p.riskScore >= 6 && p.riskScore < 8).length,  // Average
      performanceMetrics.filter(p => p.riskScore < 6).length  // At Risk
    ]

    // Calculate faculty workload with efficiency metrics
    const faculty = await prisma.faculty.findMany({
      where: {
        courses: {
          some: {
            course: {
              ...courseFilter,
              department: departmentFilter
            }
          }
        }
      },
      include: {
        courses: {
          include: {
            course: true
          }
        },
        attendance: {
          where: baseFilters
        }
      }
    })

    const facultyWorkload = {
      labels: faculty.map(f => f.name),
      data: faculty.map(f => f.courses.length),
      efficiency: faculty.map(f => {
        const attendance = f.attendance.length > 0
          ? (f.attendance.filter(a => a.status === 'PRESENT').length / f.attendance.length * 100)
          : 0
        return {
          coursesPerMonth: f.courses.length / months,
          attendanceRate: attendance.toFixed(2)
        }
      })
    }

    // Return enhanced analytics data
    return NextResponse.json({
      attendanceTrends,
      departmentStats,
      performanceDistribution,
      facultyWorkload,
      summary: {
        totalStudents: students.length,
        totalFaculty: faculty.length,
        averageAttendance: calculateAverage(performanceMetrics.map(p => p.attendancePercentage)),
        riskDistribution: {
          high: performanceMetrics.filter(p => p.riskScore < 5).length,
          medium: performanceMetrics.filter(p => p.riskScore >= 5 && p.riskScore < 7).length,
          low: performanceMetrics.filter(p => p.riskScore >= 7).length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function calculateTrend(values: number[]): string {
  if (values.length < 2) return 'Stable'
  const diff = values[values.length - 1] - values[0]
  if (diff > 5) return 'Improving'
  if (diff < -5) return 'Declining'
  return 'Stable'
}

function calculateRiskScore(attendance: number, recentTrend: number): number {
  // Scale: 0-10, where 10 is best
  const attendanceScore = attendance / 10  // 0-10 points
  const trendScore = recentTrend / 10     // 0-10 points
  return (attendanceScore * 0.7 + trendScore * 0.3)  // Weighted average
}

function calculateAverage(values: number[]): number {
  return values.length > 0
    ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
    : 0
} 