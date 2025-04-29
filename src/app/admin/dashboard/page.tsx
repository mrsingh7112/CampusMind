'use client'

import Link from 'next/link'
import FacultyApprovalCard from '@/components/admin/FacultyApprovalCard'
import StudentStatsCard from '@/components/admin/StudentStatsCard'
import DepartmentStatsCard from '@/components/admin/DepartmentStatsCard'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, Megaphone } from 'lucide-react'
import { useSession } from 'next-auth/react'
import useSWR, { mutate } from 'swr'
import RecentActivityLogs from '@/components/admin/RecentActivityLogs'
import DashboardCharts from '@/components/admin/DashboardCharts'
import NotificationsSummary from '@/components/admin/NotificationsSummary'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    newStudents: 0,
    newFaculty: 0,
    recentResults: [],
    recentAttendance: [],
    departments: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // SWR for live stats
  const { data: students = [], isLoading: loadingStudents } = useSWR('/api/admin/students', fetcher, { refreshInterval: 3000 })
  const { data: faculty = [], isLoading: loadingFaculty } = useSWR('/api/admin/faculty', fetcher, { refreshInterval: 3000 })
  const { data: newStudents = [], isLoading: loadingNewStudents } = useSWR('/api/admin/students?new=true', fetcher, { refreshInterval: 3000 })
  const { data: newFaculty = [], isLoading: loadingNewFaculty } = useSWR('/api/admin/faculty?new=true', fetcher, { refreshInterval: 3000 })

  // SWR for real-time departments
  const { data: departments, isLoading: loadingDepartments } = useSWR(
    '/api/admin/departments',
    fetcher,
    { refreshInterval: 3000 }
  )

  // SWR for public signup requests
  const { data: publicSignups = [], mutate: mutateSignups } = useSWR('/api/admin/publicsignup', fetcher, { refreshInterval: 3000 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch recent results and attendance
        const [resultsRes, attendanceRes] = await Promise.all([
          fetch('/api/admin/results'),
          fetch('/api/admin/attendance'),
        ])
        
        if (!resultsRes.ok || !attendanceRes.ok) {
          throw new Error('Failed to fetch data')
        }
        
        const results = await resultsRes.json()
        const attendance = await attendanceRes.json()

        // Update stats with current data
        setStats(prevStats => ({
          ...prevStats,
          totalStudents: students?.length || 0,
          totalFaculty: faculty?.length || 0,
          newStudents: newStudents?.length || 0,
          newFaculty: newFaculty?.length || 0,
          recentResults: Array.isArray(results) ? results.slice(0, 5) : [],
          recentAttendance: Array.isArray(attendance) ? attendance.slice(0, 5) : [],
          departments: departments || [],
        }))
        setError('')
      } catch (error) {
        console.error('Error fetching stats:', error)
        setError('Failed to fetch dashboard statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [students, faculty, newStudents, newFaculty, departments])

  // Filter pending requests
  const publicSignupsArray = Array.isArray(publicSignups) ? publicSignups : [];
  const pendingFaculty = publicSignupsArray.filter((s: any) => s.role === 'FACULTY')
  const pendingStudents = publicSignupsArray.filter((s: any) => s.role === 'STUDENT')

  // Approve/Reject handlers
  const handleApprove = async (id: string) => {
    await fetch(`/api/admin/publicsignup/${id}/approve`, { method: 'POST' })
    mutateSignups()
    // Refresh all relevant SWR data
    mutate('/api/admin/students')
    mutate('/api/admin/faculty')
    mutate('/api/admin/students?new=true')
    mutate('/api/admin/faculty?new=true')
  }
  const handleReject = async (id: string) => {
    await fetch(`/api/admin/publicsignup/${id}`, { method: 'DELETE' })
    mutateSignups()
    // Refresh all relevant SWR data
    mutate('/api/admin/students')
    mutate('/api/admin/faculty')
    mutate('/api/admin/students?new=true')
    mutate('/api/admin/faculty?new=true')
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <div className="text-lg text-blue-700 font-semibold">Loading dashboard...</div>
    </div>
  )
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-50">
      <main className="flex-1 px-6 md:px-10 lg:px-16 pt-28">
        <div className="max-w-6xl mx-auto">
      {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-300 rounded-xl shadow-lg p-5 flex flex-col items-center text-white">
              <UserPlus className="w-10 h-10 mb-2" />
              <h3 className="text-lg font-semibold mb-1">Total Faculty</h3>
              <p className="text-3xl font-bold mb-1">{loadingFaculty ? '-' : faculty.length}</p>
              <p className="text-sm opacity-80">Active members</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-300 rounded-xl shadow-lg p-5 flex flex-col items-center text-white">
              <UserPlus className="w-10 h-10 mb-2" />
              <h3 className="text-lg font-semibold mb-1">Total Students</h3>
              <p className="text-3xl font-bold mb-1">{loadingStudents ? '-' : students.length}</p>
              <p className="text-sm opacity-80">Enrolled</p>
          </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-300 rounded-xl shadow-lg p-5 flex flex-col items-center text-white">
              <UserPlus className="w-10 h-10 mb-2" />
              <h3 className="text-lg font-semibold mb-1">New Students</h3>
              <p className="text-3xl font-bold mb-1">{loadingNewStudents ? '-' : newStudents.length}</p>
              <p className="text-sm opacity-80">New enrollments</p>
          </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-xl shadow-lg p-5 flex flex-col items-center text-white">
              <UserPlus className="w-10 h-10 mb-2" />
              <h3 className="text-lg font-semibold mb-1">New Faculty</h3>
              <p className="text-3xl font-bold mb-1">{loadingNewFaculty ? '-' : newFaculty.length}</p>
              <p className="text-sm opacity-80">New faculty members</p>
          </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Approval Requests and Departments */}
            <div className="col-span-2 space-y-8">
              {/* Faculty Approval Requests */}
              <div className="bg-white rounded-xl shadow p-5 border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Faculty Approval Requests</h3>
        </div>
        {pendingFaculty.length === 0 ? (
                  <div className="text-gray-400">No pending faculty approvals</div>
        ) : (
          <ul className="space-y-2">
            {pendingFaculty.map((f: any) => (
              <li key={f.id} className="flex flex-col md:flex-row md:items-center md:gap-4 border-b py-2">
                <div className="flex-1">
                  <div className="font-bold text-blue-800">{f.name}</div>
                  <div className="text-sm text-gray-600">{f.position} • {f.department}</div>
                  <div className="text-xs text-gray-500">ID: {f.tokenId} • {f.email}</div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                          <Button size="sm" className="bg-green-500 text-white hover:bg-green-600" onClick={() => handleApprove(f.id)}>Approve</Button>
                          <Button size="sm" className="bg-red-500 text-white hover:bg-red-600" onClick={() => handleReject(f.id)}>Reject</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
              {/* Student Approval Requests */}
              <div className="bg-white rounded-xl shadow p-5 border border-green-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-green-700 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Student Approval Requests</h3>
        </div>
        {pendingStudents.length === 0 ? (
                  <div className="text-gray-400">No pending student approvals</div>
        ) : (
          <ul className="space-y-2">
            {pendingStudents.map((s: any) => (
              <li key={s.id} className="flex flex-col md:flex-row md:items-center md:gap-4 border-b py-2">
                <div className="flex-1">
                  <div className="font-bold text-green-800">{s.name}</div>
                  <div className="text-sm text-gray-600">{s.department} • Semester {s.semester}</div>
                  <div className="text-xs text-gray-500">ID: {s.tokenId} • {s.email}</div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                          <Button size="sm" className="bg-green-500 text-white hover:bg-green-600" onClick={() => handleApprove(s.id)}>Approve</Button>
                          <Button size="sm" className="bg-red-500 text-white hover:bg-red-600" onClick={() => handleReject(s.id)}>Reject</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
              {/* Student Statistics */}
              <div className="bg-white rounded-xl shadow p-5 border border-cyan-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-cyan-700 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Student Statistics</h3>
                  <a href="/admin/students" className="text-sm text-indigo-600 hover:text-indigo-500">View all students</a>
                </div>
                <StudentStatsCard />
              </div>
              {/* Recent Activity Logs */}
              <RecentActivityLogs />
            </div>
            {/* Departments and Quick Actions */}
            <div className="space-y-8">
              {/* Departments */}
              <div className="bg-white rounded-xl shadow p-5 border border-purple-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-purple-700 flex items-center gap-2"><Megaphone className="w-5 h-5" /> Departments</h3>
                  <a href="/admin/departments/manage" className="text-sm text-indigo-600 hover:text-indigo-500">Manage departments</a>
                </div>
                <ul className="space-y-1">
                  {loadingDepartments ? (
                    <li className="animate-pulse text-gray-400">Loading...</li>
                  ) : departments && departments.length > 0 ? (
                    departments.map((dept: any) => (
                      <li key={dept.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full shadow text-sm text-blue-700 font-medium">
                            {dept.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{dept.courses?.length || 0} courses</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {dept.courses?.reduce((total: number, course: any) => total + (course.subjects?.length || 0), 0) || 0} subjects
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">No departments added yet. Add departments from the Manage Departments page.</li>
                  )}
                </ul>
              </div>
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow p-5 border border-orange-100">
                <h3 className="text-lg font-bold text-orange-700 mb-3 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Quick Actions</h3>
                <div className="flex flex-col gap-3">
                  <a href="/admin/students/add" className="group">
                    <Button className="w-full h-16 text-base flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg group-hover:scale-105 group-hover:from-green-500 group-hover:to-blue-600 transition-transform duration-200">
                      <UserPlus className="w-7 h-7 mb-1" />
              Add New Student
            </Button>
                  </a>
                  <a href="/admin/faculty/add" className="group">
                    <Button className="w-full h-16 text-base flex flex-col items-center justify-center bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg group-hover:scale-105 group-hover:from-purple-500 group-hover:to-pink-600 transition-transform duration-200">
                      <UserPlus className="w-7 h-7 mb-1" />
              Add New Faculty
            </Button>
                  </a>
                  <a href="/admin/departments/add" className="group">
                    <Button className="w-full h-16 text-base flex flex-col items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg group-hover:scale-105 group-hover:from-cyan-500 group-hover:to-blue-700 transition-transform duration-200">
                      <UserPlus className="w-7 h-7 mb-1" />
              Add Department
            </Button>
                  </a>
                  <a href="/admin/announcements/add" className="group">
                    <Button className="w-full h-16 text-base flex flex-col items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg group-hover:scale-105 group-hover:from-yellow-500 group-hover:to-orange-600 transition-transform duration-200">
                      <Megaphone className="w-7 h-7 mb-1" />
              Send Announcement
            </Button>
                  </a>
                </div>
              </div>
              {/* Graphs/Charts */}
              <DashboardCharts />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 