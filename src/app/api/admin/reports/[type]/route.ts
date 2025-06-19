import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function toCSV(headers: string[], rows: any[][]): string {
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

export async function POST(
  req: Request,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params
    const url = new URL(req.url)
    const format = url.searchParams.get('format') || 'csv'

    if (type === 'attendance') {
      // Fetch real attendance data
      const attendanceRecords = await prisma.studentAttendance.findMany({
        include: {
          student: {
            include: {
              course: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        }
      })

      // For charting: group by date, calculate % present
      if (format === 'json') {
        const grouped: Record<string, { present: number, total: number }> = {}
        attendanceRecords.forEach(record => {
          const date = record.date.toISOString().split('T')[0]
          if (!grouped[date]) grouped[date] = { present: 0, total: 0 }
          grouped[date].total++
          if (record.status === 'PRESENT') grouped[date].present++
        })
        const labels = Object.keys(grouped)
        const values = labels.map(date =>
          grouped[date].total > 0 ? Number(((grouped[date].present / grouped[date].total) * 100).toFixed(2)) : 0
        )
        return NextResponse.json({ data: { labels, values } })
      }

      // For CSV: output all records
      let csvContent = 'Date,Student ID,Student Name,Course,Status\n'
      csvContent += attendanceRecords.map(r =>
        `${r.date.toISOString().split('T')[0]},${r.student.id},${r.student.name},${r.student.course.name},${r.status}`
      ).join('\n')
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="attendance_report.csv"`,
        },
      })
    }

    if (type === 'academic') {
      const students = await prisma.student.findMany({
        include: {
          course: true,
          grades: true
        }
      })
      if (format === 'json') {
        // For charting: average grade per course
        const courseMap: Record<string, number[]> = {}
        students.forEach(student => {
          student.grades.forEach(grade => {
            if (!courseMap[grade.subject]) courseMap[grade.subject] = []
            courseMap[grade.subject].push(grade.value)
          })
        })
        const labels = Object.keys(courseMap)
        const values = labels.map(subject => {
          const arr = courseMap[subject]
          return arr.length > 0 ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0
        })
        return NextResponse.json({ data: { labels, values } })
      }
      // CSV
      const headers = ['Student ID', 'Student Name', 'Course', 'Subject', 'Grade']
      const rows: any[][] = []
      students.forEach(student => {
        student.grades.forEach(grade => {
          rows.push([
            student.id,
            student.name,
            student.course?.name || '',
            grade.subject,
            grade.value
          ])
        })
      })
      return new NextResponse(toCSV(headers, rows), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="academic_report.csv"',
        },
      })
    }

    if (type === 'faculty') {
      const faculty = await prisma.faculty.findMany({
        include: {
          courses: {
            include: { course: true }
          },
          attendance: true
        }
      })
      if (format === 'json') {
        // For charting: number of courses per faculty
        const labels = faculty.map(f => f.name)
        const values = faculty.map(f => f.courses.length)
        return NextResponse.json({ data: { labels, values } })
      }
      // CSV
      const headers = ['Faculty ID', 'Name', 'Department', 'Courses Taught', 'Attendance Rate']
      const rows = faculty.map(f => [
        f.id,
        f.name,
        f.department,
        f.courses.length,
        f.attendance.length > 0 ? ((f.attendance.filter(a => a.status === 'PRESENT').length / f.attendance.length) * 100).toFixed(2) + '%' : '0%'
      ])
      return new NextResponse(toCSV(headers, rows), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="faculty_report.csv"',
        },
      })
    }

    if (type === 'student') {
      const students = await prisma.student.findMany({
        include: { course: true, attendance: true }
      })
      if (format === 'json') {
        // For charting: attendance % per student
        const labels = students.map(s => s.name)
        const values = students.map(s => s.attendance.length > 0 ? Number((s.attendance.filter(a => a.status === 'PRESENT').length / s.attendance.length * 100).toFixed(2)) : 0)
        return NextResponse.json({ data: { labels, values } })
      }
      // CSV
      const headers = ['Student ID', 'Name', 'Course', 'Department', 'Attendance %']
      const rows = students.map(s => [
        s.id,
        s.name,
        s.course?.name || '',
        s.course?.departmentId || '',
        s.attendance.length > 0 ? ((s.attendance.filter(a => a.status === 'PRESENT').length / s.attendance.length) * 100).toFixed(2) + '%' : '0%'
      ])
      return new NextResponse(toCSV(headers, rows), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="student_report.csv"',
        },
      })
    }

    if (type === 'department') {
      const departments = await prisma.department.findMany({
        include: {
          courses: {
            include: {
              students: true,
              facultyCourses: { include: { faculty: true } },
              subjects: true
            }
          }
        }
      })
      if (format === 'json') {
        // For charting: total students per department
        const labels = departments.map(d => d.name)
        const values = departments.map(d => d.courses.reduce((sum, c) => sum + c.students.length, 0))
        return NextResponse.json({ data: { labels, values } })
      }
      // CSV
      const headers = ['Department', 'Total Students', 'Total Faculty', 'Avg Attendance %', 'Subjects']
      const rows = departments.map(d => [
        d.name,
        d.courses.reduce((sum, c) => sum + c.students.length, 0),
        new Set(d.courses.flatMap(c => c.facultyCourses.map(fc => fc.faculty.id))).size,
        (() => {
          const att = d.courses.flatMap(c => c.students.flatMap(s => s.attendance))
          return att.length > 0 ? ((att.filter(a => a.status === 'PRESENT').length / att.length) * 100).toFixed(2) + '%' : '0%'
        })(),
        d.courses.reduce((sum, c) => sum + c.subjects.length, 0)
      ])
      return new NextResponse(toCSV(headers, rows), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="department_report.csv"',
        },
      })
    }

    if (type === 'system') {
      const logs = await prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' }
      })
      if (format === 'json') {
        // For charting: actions count
        const actionMap: Record<string, number> = {}
        logs.forEach(log => {
          actionMap[log.action] = (actionMap[log.action] || 0) + 1
        })
        const labels = Object.keys(actionMap)
        const values = labels.map(l => actionMap[l])
        return NextResponse.json({ data: { labels, values } })
      }
      // CSV
      const headers = ['Log ID', 'Timestamp', 'User ID', 'User Type', 'Action', 'Entity', 'Details', 'IP Address', 'User Agent']
      const rows = logs.map(log => [
        log.id,
        log.createdAt.toISOString(),
        log.userId,
        log.userType,
        log.action,
        log.entity,
        log.details,
        log.ipAddress || '',
        log.userAgent || ''
      ])
      return new NextResponse(toCSV(headers, rows), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="system_report.csv"',
        },
      })
    }

    if (type === 'custom') {
      // Implement your custom report logic here
      if (format === 'json') {
        return NextResponse.json({ data: { labels: [], values: [] } })
      }
      return new NextResponse('No data', {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="custom_report.csv"',
        },
      })
    }

    if (type === 'predictions') {
      // Use the same logic as the predictions endpoint
      const students = await prisma.student.findMany({
        include: {
          attendance: {
            orderBy: { date: 'desc' },
            take: 10
          },
          course: { include: { department: true } }
        }
      })
      const predictions = students.map(student => {
        const attendancePercentage = student.attendance.length > 0
          ? (student.attendance.filter(a => a.status === 'PRESENT').length / student.attendance.length * 100)
          : 0
        const recentAttendance = student.attendance
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)
        const recentTrend = recentAttendance.length > 0
          ? (recentAttendance.filter(a => a.status === 'PRESENT').length / recentAttendance.length * 100)
          : 0
        const riskScore = (attendancePercentage * 0.7 + recentTrend * 0.3) / 10
        let riskLevel = 'Low'
        let recommendation = 'Continue current study pattern'
        if (riskScore < 6) {
          riskLevel = 'High'
          recommendation = 'Schedule meeting with academic advisor'
        } else if (riskScore < 8) {
          riskLevel = 'Medium'
          recommendation = 'Focus on attendance and seek additional help'
        }
        const predictedGrade = Math.min(100, Math.max(60, 
          (attendancePercentage * 0.6 + (10 - riskScore) * 4)
        )).toFixed(1)
        return {
          studentId: student.id,
          name: student.name,
          course: student.course.name,
          department: student.course.department.name,
          predictedGrade: Number(predictedGrade),
          riskLevel,
          recommendation,
          attendancePercentage: Number(attendancePercentage.toFixed(1)),
          recentTrend: Number(recentTrend.toFixed(1))
        }
      })
      if (format === 'json') {
        return NextResponse.json({ predictions })
      }
      const csvContent = [
        'Student ID,Name,Course,Department,Predicted Grade,Risk Level,Recommendation,Attendance %,Recent Trend',
        ...predictions.map(p => 
          `${p.studentId},${p.name},${p.course},${p.department},${p.predictedGrade},${p.riskLevel},${p.recommendation},${p.attendancePercentage}%,${p.recentTrend}%`
        )
      ].join('\n')
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="predictions_report.csv"',
        },
      })
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
} 