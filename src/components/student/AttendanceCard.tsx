'use client'

import { useEffect, useState } from 'react'
import { AttendancePrediction, predictAttendance } from '@/lib/ai/predictions'

interface AttendanceData {
  overall: number
  present: number
  absent: number
  late: number
  previousAttendance: number[]
}

export default function AttendanceCard() {
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState<AttendanceData>({
    overall: 0,
    present: 0,
    absent: 0,
    late: 0,
    previousAttendance: []
  })
  const [prediction, setPrediction] = useState<AttendancePrediction | null>(null)

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  const fetchAttendanceData = async () => {
    try {
      // Fetch attendance data from your API
      const response = await fetch('/api/student/attendance')
      const data = await response.json()
      setAttendance(data)

      // Get AI prediction
      const prediction = await predictAttendance({
        previousAttendance: data.previousAttendance,
        courseSchedule: [], // Add course schedule data
      })
      setPrediction(prediction)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Attendance Overview</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Overall Attendance</span>
          <span className="font-semibold text-green-600">{attendance.overall}%</span>
        </div>
        <div className="bg-gray-200 h-2 rounded-full">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${attendance.overall}%` }}
          ></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Present</p>
            <p className="font-semibold text-green-600">{attendance.present}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Absent</p>
            <p className="font-semibold text-red-600">{attendance.absent}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Late</p>
            <p className="font-semibold text-yellow-600">{attendance.late}</p>
          </div>
        </div>

        {prediction && (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Prediction</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Predicted Attendance</span>
                <span className="font-semibold text-blue-600">
                  {prediction.predictedAttendance.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Risk Level</span>
                <span className={`font-semibold ${getRiskLevelColor(prediction.riskLevel)}`}>
                  {prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)}
                </span>
              </div>
              {prediction.recommendations.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">Recommendations:</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {prediction.recommendations.map((rec, index) => (
                      <li key={index} className="ml-2">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 