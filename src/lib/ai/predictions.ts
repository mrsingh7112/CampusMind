// Fallback values when AI is unavailable
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

export async function predictStudentPerformance() {
    return defaultPerformanceMetrics
  }

export async function predictAttendance() {
    return defaultAttendancePrediction
  }

export async function generatePersonalizedLearningPlan() {
    return {
      weeklyPlan: [],
      resources: ['Data not available'],
      milestones: ['Data not available']
  }
} 