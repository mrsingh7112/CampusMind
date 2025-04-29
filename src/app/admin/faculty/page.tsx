'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

interface Faculty {
  id: string
  name: string
  email: string
  department: string
  position: string
  tokenId: string
  status: string
  assignedCourses?: {
    course: {
      id: number
      name: string
      code: string
    }
  }[]
}

interface Course {
  id: string
  name: string
  code: string
  departmentId: string
}

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)
  const router = useRouter()

  // Fetch faculty data with courses
  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/faculty')
      if (!res.ok) throw new Error('Failed to fetch faculty data')
      const data = await res.json()
      setFaculty(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching faculty:', err)
      setError('Failed to load faculty data')
      setLoading(false)
    }
  }

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses')
      if (!res.ok) throw new Error('Failed to fetch courses')
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError('Failed to load courses')
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
    fetchCourses()
  }, [])

  // Handle faculty removal
  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this faculty member?')) return
    try {
      const res = await fetch(`/api/admin/faculty/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to remove faculty member')
      fetchData()
    } catch (err) {
      console.error('Error removing faculty:', err)
      setError('Failed to remove faculty member')
    }
  }

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/faculty/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      fetchData()
      setShowDetailsModal(false)
    } catch (err) {
      console.error('Error updating status:', err)
      setError('Failed to update status')
    }
  }

  // Handle course assignment
  const handleAssignCourse = async () => {
    if (!selectedFaculty || !selectedCourse) {
      setError('Please select a course')
      return
    }

    setAssignLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/faculty/assign-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFaculty.id,
          courseId: selectedCourse
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign course')
      }

      setSuccess(`Successfully assigned ${data.data.courseName} to ${data.data.facultyName}`)
      fetchData()
      setShowAssignModal(false)
      setSelectedCourse('')
    } catch (err: any) {
      console.error('Error assigning course:', err)
      setError(err.message || 'Failed to assign course')
    } finally {
      setAssignLoading(false)
    }
  }

  // Handle sending notification
  const handleSendNotification = async () => {
    if (!selectedFaculty || !notificationTitle || !notificationMessage) return
    try {
      const res = await fetch('/api/faculty/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: selectedFaculty.id,
          title: notificationTitle,
          message: notificationMessage
        })
      })
      if (!res.ok) throw new Error('Failed to send notification')
      setShowNotificationModal(false)
      setNotificationTitle('')
      setNotificationMessage('')
    } catch (err) {
      console.error('Error sending notification:', err)
      setError('Failed to send notification')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Faculty Management</h1>
        <Button 
          variant="default" 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => window.location.href = '/admin/faculty/add'}
        >
          Add Faculty
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600">Loading faculty data...</p>
        </div>
      ) : faculty.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No faculty members found</p>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/admin/faculty/add'}
          >
            Add Your First Faculty Member
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faculty.map((member) => (
                <tr 
                  key={member.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedFaculty(member)
                    setShowDetailsModal(true)
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.department || 'Not set'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.position || 'Not set'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.tokenId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(member.id)
                      }}
                      className="text-sm"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Faculty Details Modal */}
      {showDetailsModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-700">Faculty Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-semibold">Name:</label>
                <p>{selectedFaculty.name}</p>
              </div>
              <div>
                <label className="font-semibold">Email:</label>
                <p>{selectedFaculty.email}</p>
              </div>
              <div>
                <label className="font-semibold">Department:</label>
                <p>{selectedFaculty.department || 'Not set'}</p>
              </div>
              <div>
                <label className="font-semibold">Position:</label>
                <p>{selectedFaculty.position || 'Not set'}</p>
              </div>
              <div>
                <label className="font-semibold">Token ID:</label>
                <p>{selectedFaculty.tokenId}</p>
              </div>
              <div>
                <label className="font-semibold">Status:</label>
                <p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedFaculty.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedFaculty.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="font-semibold">Assigned Courses:</label>
                {selectedFaculty.assignedCourses && selectedFaculty.assignedCourses.length > 0 ? (
                  <ul className="mt-1 space-y-1">
                    {selectedFaculty.assignedCourses.map((assignment) => (
                      <li key={assignment.course.id} className="text-sm">
                        {assignment.course.name} ({assignment.course.code})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No courses assigned</p>
                )}
              </div>

              <div className="flex gap-2 mt-6">
                <Button 
                  onClick={() => {
                    router.push(`/admin/faculty/edit/${selectedFaculty.id}`);
                    setShowDetailsModal(false);
                  }}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setShowAssignModal(true)
                  }}
                >
                  Assign to Course
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setShowNotificationModal(true)
                  }}
                >
                  Send Notification
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleStatusChange(selectedFaculty.id, 
                    selectedFaculty.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                  )}
                >
                  {selectedFaculty.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Assignment Modal */}
      {showAssignModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assign Course</h2>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Course
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={assignLoading}
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAssignModal(false)}
                  disabled={assignLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignCourse}
                  disabled={assignLoading}
                >
                  {assignLoading ? 'Assigning...' : 'Assign Course'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotificationModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Send Notification</h2>
              <button 
                onClick={() => setShowNotificationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <Input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter notification message"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNotificationModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendNotification}>
                  Send Notification
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 