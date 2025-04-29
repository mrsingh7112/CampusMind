import { callGeminiAPI } from './gemini'

// AI Provider configuration
const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) {
  console.warn('No Gemini API key provided. Predictions will return default values.')
}

// Interfaces
export interface PerformanceMetrics {
  currentGrade: number
  predictedGrade: number
  strengths: string[]
  areasForImprovement: string[]
  recommendedResources: string[]
}

export interface AttendancePrediction {
  predictedAttendance: number
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
}

// Fallback values when AI is unavailable
const defaultPerformanceMetrics: PerformanceMetrics = {
  currentGrade: 0,
  predictedGrade: 0,
  strengths: ['Data not available'],
  areasForImprovement: ['Data not available'],
  recommendedResources: ['Data not available']
}

const defaultAttendancePrediction: AttendancePrediction = {
  predictedAttendance: 0,
  riskLevel: 'medium',
  recommendations: ['Data not available']
}

export async function predictStudentPerformance(
  studentData: {
    assignments: any[]
    attendance: number
    previousGrades: number[]
    courseId: string
  }
): Promise<PerformanceMetrics> {
  if (!API_KEY) {
    return defaultPerformanceMetrics
  }

  try {
    const prompt = `Analyze student performance with the following data:
    - Current attendance: ${studentData.attendance}%
    - Previous grades: ${studentData.previousGrades.join(', ')}
    - Completed assignments: ${studentData.assignments.length}
    
    Provide analysis in JSON format with:
    {
      "currentGrade": number,
      "predictedGrade": number,
      "strengths": string[],
      "areasForImprovement": string[],
      "recommendedResources": string[]
    }`

    const analysis = await callGeminiAPI(prompt)

    return {
      currentGrade: analysis?.currentGrade || defaultPerformanceMetrics.currentGrade,
      predictedGrade: analysis?.predictedGrade || defaultPerformanceMetrics.predictedGrade,
      strengths: analysis?.strengths || defaultPerformanceMetrics.strengths,
      areasForImprovement: analysis?.areasForImprovement || defaultPerformanceMetrics.areasForImprovement,
      recommendedResources: analysis?.recommendedResources || defaultPerformanceMetrics.recommendedResources,
    }
  } catch (error) {
    console.error('Error predicting performance:', error)
    return defaultPerformanceMetrics
  }
}

export async function predictAttendance(
  studentData: {
    previousAttendance: number[]
    courseSchedule: any[]
    weatherForecast?: string
  }
): Promise<AttendancePrediction> {
  if (!API_KEY) {
    return defaultAttendancePrediction
  }

  try {
    const averageAttendance = studentData.previousAttendance.reduce((a, b) => a + b, 0) / studentData.previousAttendance.length

    const prompt = `Predict student attendance based on:
    - Average attendance: ${averageAttendance}%
    - Previous attendance pattern: ${studentData.previousAttendance.join(', ')}
    - Weather forecast: ${studentData.weatherForecast || 'Not available'}
    
    Provide prediction in JSON format with:
    {
      "predictedAttendance": number,
      "riskLevel": "low" | "medium" | "high",
      "recommendations": string[]
    }`

    const prediction = await callGeminiAPI(prompt)

    return {
      predictedAttendance: prediction?.predictedAttendance || averageAttendance,
      riskLevel: prediction?.riskLevel || defaultAttendancePrediction.riskLevel,
      recommendations: prediction?.recommendations || defaultAttendancePrediction.recommendations,
    }
  } catch (error) {
    console.error('Error predicting attendance:', error)
    return defaultAttendancePrediction
  }
}

export async function generatePersonalizedLearningPlan(
  studentData: {
    courseId: string
    strengths: string[]
    weaknesses: string[]
    learningStyle: string
    goals: string[]
  }
): Promise<{
  weeklyPlan: any[]
  resources: string[]
  milestones: string[]
}> {
  if (!API_KEY) {
    return {
      weeklyPlan: [],
      resources: ['Data not available'],
      milestones: ['Data not available']
    }
  }

  try {
    const prompt = `Create a personalized learning plan for a student with:
    - Learning style: ${studentData.learningStyle}
    - Strengths: ${studentData.strengths.join(', ')}
    - Areas to improve: ${studentData.weaknesses.join(', ')}
    - Goals: ${studentData.goals.join(', ')}
    
    Provide plan in JSON format with:
    {
      "weeklyPlan": any[],
      "resources": string[],
      "milestones": string[]
    }`

    const plan = await callGeminiAPI(prompt)

    return {
      weeklyPlan: plan?.weeklyPlan || [],
      resources: plan?.resources || ['Data not available'],
      milestones: plan?.milestones || ['Data not available'],
    }
  } catch (error) {
    console.error('Error generating learning plan:', error)
    return {
      weeklyPlan: [],
      resources: ['Error generating plan'],
      milestones: ['Error generating plan']
    }
  }
} 