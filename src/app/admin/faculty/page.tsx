'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Edit2, Bell, Ban, Layers } from 'lucide-react'

interface Faculty {
  id: string
  name: string
  email: string
  department: string
  position: string
  employeeId: string
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
  id: number
  name: string
  code: string
  departmentId: number
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
  const [selectedSemester, setSelectedSemester] = useState('')
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

  // Initial data fetch and polling for real-time updates
  useEffect(() => {
    fetchData()
    fetchCourses()
    const interval = setInterval(fetchData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
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
      const res = await fetch(`/api/admin/faculty`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
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
    if (!selectedFaculty || !selectedCourse || !selectedSemester) {
      setError('Please select a course and semester')
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
          courseId: Number(selectedCourse),
          semester: parseInt(selectedSemester)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign course')
      }

      setSuccess(`Successfully assigned ${data.data.courseName} to ${data.data.facultyName}`)
      fetchData() // Refresh data immediately
      setShowAssignModal(false)
      setSelectedCourse('')
      setSelectedSemester('')
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
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Faculty Management</h1>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow" onClick={() => window.location.href = '/admin/faculty/add'}>Add Faculty</Button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Name</th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Email</th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Department</th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Position</th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Employee ID</th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Status</th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Assigned Courses</th>
                <th className="py-4 px-6 text-left text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {faculty.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-blue-50 transition cursor-pointer group"
                  tabIndex={0}
                  onClick={e => {
                    // Prevent opening modal if clicking on an action button
                    if ((e.target as HTMLElement).closest('button')) return;
                    setSelectedFaculty(member);
                    setShowDetailsModal(true);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedFaculty(member);
                      setShowDetailsModal(true);
                    }
                  }}
                >
                  <td className="py-4 px-6 font-semibold text-blue-800 group-hover:underline">{member.name}</td>
                  <td className="py-4 px-6 text-gray-700">{member.email}</td>
                  <td className="py-4 px-6">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {member.department}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700">{member.position}</td>
                  <td className="py-4 px-6">
                    <span className="inline-block bg-purple-100 text-purple-700 text-xs font-mono px-3 py-1 rounded-full">
                      {member.employeeId}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {member.assignedCourses && member.assignedCourses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {member.assignedCourses.map((ac, idx) => (
                          <span key={idx} className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                            {ac.course.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">None</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="hover:bg-blue-100" title="Edit" onClick={e => { e.stopPropagation(); router.push(`/admin/faculty/edit/${member.id}`); }}>
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button size="icon" variant="outline" className="hover:bg-gray-100" title="Details" onClick={e => { e.stopPropagation(); setSelectedFaculty(member); setShowDetailsModal(true); }}>
                        <Layers className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty Details Modal */}
      {showDetailsModal && selectedFaculty && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setShowDetailsModal(false)}>
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              Faculty Details
            </h2>
            <div className="space-y-2">
              <div><span className="font-semibold">Name:</span> {selectedFaculty.name}</div>
              <div><span className="font-semibold">Email:</span> {selectedFaculty.email}</div>
              <div>
                <span className="font-semibold">Department:</span>
                <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">{selectedFaculty.department}</span>
              </div>
              <div><span className="font-semibold">Position:</span> {selectedFaculty.position}</div>
              <div>
                <span className="font-semibold">Employee ID:</span>
                <span className="ml-2 px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs">{selectedFaculty.employeeId}</span>
              </div>
              <div>
                <span className="font-semibold">Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${selectedFaculty.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                  {selectedFaculty.status}
                </span>
              </div>
              <div>
                <span className="font-semibold">Assigned Courses:</span>
                {selectedFaculty.assignedCourses && selectedFaculty.assignedCourses.length > 0 ? (
                  <ul className="ml-2 flex flex-wrap gap-2 mt-1">
                    {selectedFaculty.assignedCourses.map((c) => (
                      <li key={c.course.id} className="bg-blue-50 px-2 py-0.5 rounded text-blue-700 text-xs">
                        {c.course.name} <span className="text-gray-500">({c.course.code})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="ml-2 text-gray-500">No courses assigned</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              <Button onClick={() => {
                setShowDetailsModal(false);
                router.push(`/admin/faculty/edit/${selectedFaculty.id}`);
              }} variant="outline"><Edit2 className="w-4 h-4 mr-1" /> Edit</Button>
              <Button onClick={() => setShowAssignModal(true)} variant="outline"><Layers className="w-4 h-4 mr-1" /> Assign to Course</Button>
              <Button onClick={() => setShowNotificationModal(true)} variant="outline"><Bell className="w-4 h-4 mr-1" /> Notify</Button>
              <Button onClick={() => handleStatusChange(selectedFaculty.id, selectedFaculty.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')} variant="destructive"><Ban className="w-4 h-4 mr-1" /> {selectedFaculty.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</Button>
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Semester
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={selectedSemester}
                  onChange={e => setSelectedSemester(e.target.value)}
                  disabled={assignLoading}
                  placeholder="Enter semester (e.g. 1, 2, 3...)"
                />
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