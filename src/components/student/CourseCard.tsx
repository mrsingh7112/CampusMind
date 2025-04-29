'use client'

import { useEffect, useState } from 'react'
import { PerformanceMetrics } from '@/lib/ai/predictions'

interface Course {
  id: string
  code: string
  name: string
  credits: number
  faculty: {
    name: string
  }
  performance?: PerformanceMetrics
}

export default function CourseCard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/student/courses')
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      
      const data = await response.json()
      
      // Fetch all predictions in a single batch
      const predictionsResponse = await fetch('/api/student/predictions/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courses: data.map((course: Course) => ({
            courseId: course.id,
            assignments: course.assignments || [],
            attendance: course.attendance || 85,
            previousGrades: course.grades || [85, 88, 92],
          }))
        })
      })

      if (!predictionsResponse.ok) {
        console.warn('Failed to fetch predictions, continuing without them')
      } else {
        const predictions = await predictionsResponse.json()
        data.forEach((course: Course, index: number) => {
          course.performance = predictions[index]
        })
      }

      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError('Failed to load courses. Please try again later.')
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

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={() => fetchCourses()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Enrolled Courses</h3>
        <p className="text-gray-500 text-center">No courses found. Please enroll in some courses.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Enrolled Courses</h3>
      <div className="space-y-4">
        {courses.map((course) => (
          <div 
            key={course.id}
            className="border rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => setSelectedCourse(course === selectedCourse ? null : course)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{course.name}</p>
                <p className="text-sm text-gray-500">{course.code} • {course.credits} Credits</p>
                <p className="text-sm text-gray-500">Faculty: {course.faculty.name}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded mb-2">
                  Enrolled
                </span>
                {course.performance && (
                  <span className="text-sm font-medium text-blue-600">
                    Predicted Grade: {course.performance.predictedGrade}%
                  </span>
                )}
              </div>
            </div>

            {selectedCourse?.id === course.id && course.performance && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Strengths</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {course.performance.strengths.map((strength, index) => (
                        <li key={index} className="ml-2">{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Areas for Improvement</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {course.performance.areasForImprovement.map((area, index) => (
                        <li key={index} className="ml-2">{area}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommended Resources</h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {course.performance.recommendedResources.map((resource, index) => (
                      <li key={index} className="ml-2">{resource}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 