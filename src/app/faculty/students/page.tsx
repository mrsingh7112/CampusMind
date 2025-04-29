'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

interface Student {
  id: string
  name: string
  email: string
  studentId: string
  enrollmentYear: number
  semester: number
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  const classes = [
    { id: 'CS101', name: 'Introduction to Computer Science' },
    { id: 'CS201', name: 'Data Structures' },
    { id: 'CS301', name: 'Database Management' }
  ]

  const fetchStudents = async (classId: string) => {
    try {
      const response = await fetch(`/api/faculty/class/${classId}/students`)
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        variant: 'destructive'
      })
    }
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Students</h2>
          <p className="text-sm text-gray-500">
            Manage and view student information
          </p>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="w-64">
          <h3 className="mb-4 text-sm font-medium">Select Class</h3>
          <div className="space-y-2">
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => {
                  setSelectedClass(cls.id)
                  fetchStudents(cls.id)
                }}
                className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                  selectedClass === cls.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {selectedClass ? (
            <>
              <div className="mb-6">
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="border rounded-lg">
                <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b bg-gray-50">
                  <div>Student ID</div>
                  <div className="col-span-2">Name</div>
                  <div className="col-span-2">Email</div>
                  <div>Semester</div>
                </div>

                <div className="divide-y">
                  {filteredStudents.map(student => (
                    <div
                      key={student.id}
                      className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-gray-50"
                    >
                      <div className="text-sm text-gray-600">{student.studentId}</div>
                      <div className="col-span-2 font-medium">{student.name}</div>
                      <div className="col-span-2 text-sm text-gray-600">{student.email}</div>
                      <div className="text-sm text-gray-600">{student.semester}</div>
                    </div>
                  ))}
                </div>

                {filteredStudents.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No students found
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500 border rounded-lg">
              Select a class to view students
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 