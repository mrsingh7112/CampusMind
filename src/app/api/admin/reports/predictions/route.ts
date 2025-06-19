import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    // Parse query params for format
    const url = new URL(req.url)
    const format = url.searchParams.get('format') || 'csv'

    // Fetch student data with their performance metrics
    const students = await prisma.student.findMany({
      include: {
        attendance: {
          orderBy: {
            date: 'desc'
          },
          take: 10
        },
        course: {
          include: {
            department: true
          }
        }
      }
    })

    // Calculate predictions for each student
    const predictions = students.map(student => {
      // Calculate attendance percentage
      const attendancePercentage = student.attendance.length > 0
        ? (student.attendance.filter(a => a.status === 'PRESENT').length / student.attendance.length * 100)
        : 0

      // Calculate recent trend
      const recentAttendance = student.attendance
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
      
      const recentTrend = recentAttendance.length > 0
        ? (recentAttendance.filter(a => a.status === 'PRESENT').length / recentAttendance.length * 100)
        : 0

      // Calculate risk score (0-10)
      const riskScore = (attendancePercentage * 0.7 + recentTrend * 0.3) / 10

      // Determine risk level and recommendations
      let riskLevel = 'Low'
      let recommendation = 'Continue current study pattern'
      
      if (riskScore < 6) {
        riskLevel = 'High'
        recommendation = 'Schedule meeting with academic advisor'
      } else if (riskScore < 8) {
        riskLevel = 'Medium'
        recommendation = 'Focus on attendance and seek additional help'
      }

      // Predict grade based on attendance and risk score
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
      // Return JSON data for charting
      return NextResponse.json({ predictions })
    }

    // Generate CSV content
    const csvContent = [
      'Student ID,Name,Course,Department,Predicted Grade,Risk Level,Recommendation,Attendance %,Recent Trend',
      ...predictions.map(p => 
        `${p.studentId},${p.name},${p.course},${p.department},${p.predictedGrade},${p.riskLevel},${p.recommendation},${p.attendancePercentage}%,${p.recentTrend}%`
      )
    ].join('\n')

    // Return the file directly
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="predictions_report.csv"',
      },
    })
  } catch (error) {
    console.error('Error generating predictions:', error)
    return NextResponse.json({ error: 'Failed to generate predictions' }, { status: 500 })
  }
} 