import { NextResponse } from 'next/server'
import { predictStudentPerformance, predictAttendance, generatePersonalizedLearningPlan } from '@/lib/ai/predictions'

export async function GET() {
  try {
    // Test data
    const studentData = {
      assignments: [
        { id: 1, score: 85 },
        { id: 2, score: 90 }
      ],
      attendance: 85,
      previousGrades: [85, 88, 92],
      courseId: 'TEST-101'
    }

    const attendanceData = {
      previousAttendance: [90, 85, 88, 92, 87],
      courseSchedule: [],
      weatherForecast: 'Sunny'
    }

    const learningPlanData = {
      courseId: 'TEST-101',
      strengths: ['Mathematics', 'Problem Solving'],
      weaknesses: ['Time Management', 'Written Communication'],
      learningStyle: 'Visual',
      goals: ['Improve grades', 'Better time management']
    }

    // Test all AI predictions
    const [performance, attendance, learningPlan] = await Promise.all([
      predictStudentPerformance(studentData),
      predictAttendance(attendanceData),
      generatePersonalizedLearningPlan(learningPlanData)
    ])

    return NextResponse.json({
      success: true,
      data: {
        performance,
        attendance,
        learningPlan
      }
    })
  } catch (error) {
    console.error('Error testing AI:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 