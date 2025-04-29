'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { BiometricSetup } from '../BiometricSetup'
import { AttendanceMarker } from '../AttendanceMarker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

interface FacultyData {
  id: string
  name: string
  email: string
  status: string
  department: string
  hasBiometric: boolean
  lastMarked: string | null
}

export default function FacultyAttendancePage() {
  const params = useParams()
  const [faculty, setFaculty] = useState<FacultyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFacultyData()
  }, [])

  const fetchFacultyData = async () => {
    try {
      const response = await fetch(`/api/faculty/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch faculty data')
      }
      const data = await response.json()
      setFaculty(data)
    } catch (error) {
      console.error('Error fetching faculty data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (!faculty) {
    return (
      <div className="container mx-auto py-8">
        <p>Faculty not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{faculty.name}</h1>
        <p className="text-gray-500">{faculty.department}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {!faculty.hasBiometric ? (
          <BiometricSetup facultyId={faculty.id} />
        ) : (
          <AttendanceMarker
            facultyId={faculty.id}
            facultyName={faculty.name}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Attendance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <p className={`font-medium ${
                  faculty.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {faculty.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Last Attendance</p>
                <p className="font-medium">
                  {faculty.lastMarked
                    ? format(new Date(faculty.lastMarked), 'PPpp')
                    : 'Never marked'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{faculty.department}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{faculty.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 