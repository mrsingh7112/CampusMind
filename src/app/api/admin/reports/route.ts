import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFileSync } from 'fs'
import { join } from 'path'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const type = url.pathname.split('/').pop()
    let data: any[] = []
    let filename = 'report.csv'

    switch (type) {
      case 'attendance':
        // Enhanced attendance report with detailed analytics
        const attendanceData = await prisma.studentAttendance.findMany({
          include: {
            student: {
              include: {
                course: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        })

        data = attendanceData.map(record => {
          const totalDays = attendanceData.filter(a => a.studentId === record.studentId).length
          const presentDays = attendanceData.filter(a => a.studentId === record.studentId && a.status === 'PRESENT').length
          const attendancePercentage = (presentDays / totalDays) * 100

          return {
            studentId: record.student.id,
            studentName: record.student.name,
            course: record.student.course.name,
            date: record.date,
            status: record.status,
            attendancePercentage: attendancePercentage.toFixed(2) + '%',
            riskLevel: attendancePercentage < 75 ? 'High Risk' : attendancePercentage < 85 ? 'Medium Risk' : 'Good',
            notes: record.notes || 'No notes'
          }
        })
        filename = 'attendance_report.csv'
        break

      case 'academic':
        // Enhanced academic report with performance metrics
        const students = await prisma.student.findMany({
          include: {
            course: {
              include: {
                subjects: true
              }
            },
            attendance: true
          }
        })

        data = students.map(student => {
          const attendancePercentage = student.attendance.length > 0
            ? (student.attendance.filter(a => a.status === 'PRESENT').length / student.attendance.length) * 100
            : 0

          return {
            studentId: student.id,
            studentName: student.name,
            course: student.course.name,
            semester: student.semester,
            subjects: student.course.subjects.filter(s => s.semester === student.semester).map(s => s.name).join(', '),
            attendancePercentage: attendancePercentage.toFixed(2) + '%',
            status: student.status,
            enrollmentDate: student.createdAt,
            phoneNumber: student.phoneNumber || 'Not provided'
          }
        })
        filename = 'academic_report.csv'
        break

      case 'faculty':
        // Enhanced faculty report with teaching load and department info
        const facultyData = await prisma.faculty.findMany({
          include: {
            courses: {
              include: {
                course: true
              }
            },
            attendance: true
          }
        })

        data = facultyData.map(faculty => {
          const attendancePercentage = faculty.attendance.length > 0
            ? (faculty.attendance.filter(a => a.status === 'PRESENT').length / faculty.attendance.length) * 100
            : 0

          return {
            facultyId: faculty.id,
            name: faculty.name,
            department: faculty.department,
            position: faculty.position,
            courses: faculty.courses.map(c => c.course.name).join(', '),
            courseCount: faculty.courses.length,
            attendancePercentage: attendancePercentage.toFixed(2) + '%',
            status: faculty.status,
            employeeId: faculty.employeeId,
            phoneNumber: faculty.phoneNumber || 'Not provided'
          }
        })
        filename = 'faculty_report.csv'
        break

      case 'department':
        // Enhanced department report with course and student distribution
        const departments = await prisma.department.findMany({
          include: {
            courses: {
              include: {
                students: true,
                subjects: true,
                facultyCourses: {
                  include: {
                    faculty: true
                  }
                }
              }
            }
          }
        })

        data = departments.map(dept => {
          const totalStudents = dept.courses.reduce((sum, course) => sum + course.students.length, 0)
          const totalFaculty = new Set(dept.courses.flatMap(c => c.facultyCourses.map(fc => fc.faculty.id))).size

          return {
            departmentId: dept.id,
            name: dept.name,
            code: dept.code,
            totalCourses: dept.courses.length,
            totalStudents,
            totalFaculty,
            coursesOffered: dept.courses.map(c => c.name).join(', '),
            totalSubjects: dept.courses.reduce((sum, course) => sum + course.subjects.length, 0),
            status: dept.status,
            createdAt: dept.createdAt
          }
        })
        filename = 'department_report.csv'
        break

      case 'system':
        // Enhanced system report with detailed activity logs
        const logs = await prisma.activityLog.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        })

        data = logs.map(log => ({
          logId: log.id,
          timestamp: log.createdAt,
          userId: log.userId,
          userType: log.userType,
          action: log.action,
          entity: log.entity,
          details: log.details,
          ipAddress: log.ipAddress || 'Not recorded',
          userAgent: log.userAgent || 'Not recorded'
        }))
        filename = 'system_report.csv'
        break

      case 'student':
        data = await prisma.student.findMany({
          include: { course: true },
        })
        filename = 'student_report.csv'
        break

      case 'custom':
        // Implement custom report logic here
        data = []
        filename = 'custom_report.csv'
        break

      case 'predictions':
        // Implement AI/ML prediction logic here
        data = []
        filename = 'predictions_report.csv'
        break

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Convert data to CSV
    const csv = convertToCSV(data)
    const filePath = join(process.cwd(), 'public', filename)
    writeFileSync(filePath, csv)

    // Return the file
    const file = await fetch(`http://localhost:3000/${filename}`)
    const blob = await file.blob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''
  const headers = Object.keys(data[0])
  const rows = data.map(row => headers.map(header => {
    const value = row[header]
    // Handle values that might contain commas
    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }).join(','))
  return [headers.join(','), ...rows].join('\\n')
} 