'use client'

import Link from 'next/link'
import FacultyApprovalCard from '@/components/admin/FacultyApprovalCard'
import StudentStatsCard from '@/components/admin/StudentStatsCard'
import DepartmentStatsCard from '@/components/admin/DepartmentStatsCard'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, Megaphone, Layers, Landmark, Users, Clock, ClipboardCheck, Building2, TrendingUp, BellRing, BookOpen, GraduationCap, Calendar } from 'lucide-react'
import { useSession } from 'next-auth/react'
import useSWR, { mutate } from 'swr'
import RecentActivityLogs from '@/components/admin/RecentActivityLogs'
import DashboardCharts from '@/components/admin/DashboardCharts'
import NotificationsSummary from '@/components/admin/NotificationsSummary'
import clsx from 'clsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format, parseISO } from 'date-fns'

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
  const [visibleDepartmentsCount, setVisibleDepartmentsCount] = useState(3); // Initially show 3 departments
  const [layout, setLayout] = useState('card')

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
      } catch (error: any) {
        console.error('Error fetching stats:', error)
        setError('Failed to fetch dashboard statistics')
        toast({
          title: "Error",
          description: error.message || "Failed to load dashboard statistics.",
          variant: "destructive",
        });
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [students, faculty, newStudents, newFaculty, departments])

  useEffect(() => {
    setLayout(localStorage.getItem('layout') || 'card')
    const onStorage = () => setLayout(localStorage.getItem('layout') || 'card')
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Filter pending requests
  const publicSignupsArray = Array.isArray(publicSignups) ? publicSignups : [];
  const pendingFaculty = publicSignupsArray.filter((s: any) => s.role === 'FACULTY')
  const pendingStudents = publicSignupsArray.filter((s: any) => s.role === 'STUDENT')

  // Approve/Reject handlers
  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/admin/publicsignup/${id}/approve`, { method: 'POST' })
      mutateSignups()
      // Refresh all relevant SWR data
      mutate('/api/admin/students')
      mutate('/api/admin/faculty')
      mutate('/api/admin/students?new=true')
      mutate('/api/admin/faculty?new=true')
      toast({
        title: "Request Approved",
        description: "The signup request has been successfully approved.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve the request.",
        variant: "destructive",
      });
    }
  }
  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/admin/publicsignup/${id}`, { method: 'DELETE' })
      mutateSignups()
      // Refresh all relevant SWR data
      mutate('/api/admin/students')
      mutate('/api/admin/faculty')
      mutate('/api/admin/students?new=true')
      mutate('/api/admin/faculty?new=true')
      toast({
        title: "Request Rejected",
        description: "The signup request has been successfully rejected.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject the request.",
        variant: "destructive",
      });
    }
  }

  const handleShowMoreDepartments = () => {
    if (departments) {
      setVisibleDepartmentsCount(prevCount => Math.min(prevCount + 3, departments.length)); // Show 3 more or all remaining
    }
  };

  const handleShowLessDepartments = () => {
    setVisibleDepartmentsCount(3); // Reset to initial 3 departments
  };

  const departmentsToShow = Array.isArray(departments) ? departments.slice(0, visibleDepartmentsCount) : [];
  const hasMoreDepartments = Array.isArray(departments) && visibleDepartmentsCount < departments.length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <div className="text-lg text-blue-700 font-semibold">Loading dashboard...</div>
    </div>
  )
  if (error) return (
    <Card className="max-w-md mx-auto mt-10 p-6 text-center shadow-lg border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-700">Error Loading Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen flex bg-gray-50 p-6">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                <Users className="h-5 w-5 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{loadingFaculty ? '-' : faculty.length}</div>
                <p className="text-xs opacity-90 mt-1">Active members</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-5 w-5 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{loadingStudents ? '-' : students.length}</div>
                <p className="text-xs opacity-90 mt-1">Enrolled</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-400 text-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Students</CardTitle>
                <UserPlus className="h-5 w-5 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{loadingNewStudents ? '-' : newStudents.length}</div>
                <p className="text-xs opacity-90 mt-1">Recent sign-ups</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Faculty</CardTitle>
                <UserPlus className="h-5 w-5 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{loadingNewFaculty ? '-' : newFaculty.length}</div>
                <p className="text-xs opacity-90 mt-1">Recent joiners</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-blue-700 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" /> Approval Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingFaculty.length === 0 && pendingStudents.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">No pending approvals.</div>
                  ) : (
                    <div className="space-y-4">
                      {pendingFaculty.map((f: any) => (
                        <div key={f.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                          <div>
                            <p className="font-semibold text-blue-800">{f.name}</p>
                            <p className="text-sm text-gray-700">{f.position} • {f.department}</p>
                            <p className="text-xs text-gray-600">{f.email}</p>
                          </div>
                          <div className="flex gap-2 mt-3 sm:mt-0">
                            <Button size="sm" variant="success" onClick={() => handleApprove(f.id)}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(f.id)}>Reject</Button>
                          </div>
                        </div>
                      ))}
                      {pendingStudents.map((s: any) => (
                        <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                          <div>
                            <p className="font-semibold text-green-800">{s.name}</p>
                            <p className="text-sm text-gray-700">{s.courseId ? `Course: ${s.courseId}` : ''}</p>
                            <p className="text-xs text-gray-600">{s.email}</p>
                          </div>
                          <div className="flex gap-2 mt-3 sm:mt-0">
                            <Button size="sm" variant="success" onClick={() => handleApprove(s.id)}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(s.id)}>Reject</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-orange-700 flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5" /> Recent Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.recentResults.length === 0 ? (
                      <div className="text-gray-500 text-center py-4">No recent results available.</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Grade</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.recentResults.map((result: any) => (
                            <TableRow key={result.id} className="bg-orange-50 border-orange-200">
                              <TableCell className="font-semibold text-orange-800">{result.subject?.code}</TableCell>
                              <TableCell className="text-sm text-gray-700">{result.student?.name || 'N/A'}</TableCell>
                              <TableCell className="text-sm text-gray-700">{result.grade}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-teal-700 flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5" /> Recent Attendance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.recentAttendance.length === 0 ? (
                      <div className="text-gray-500 text-center py-4">No recent attendance records.</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.recentAttendance.map((record: any) => (
                            <TableRow key={record.id} className="bg-teal-50 border-teal-200">
                              <TableCell className="font-semibold text-teal-800">{record.subject?.code}</TableCell>
                              <TableCell className="text-sm text-gray-700">{record.student?.name || 'N/A'}</TableCell>
                              <TableCell className="text-sm text-gray-700">{record.status}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity and Notifications (Parallel) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-orange-700 flex items-center gap-2">
                      <Clock className="w-5 h-5" /> Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RecentActivityLogs />
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-red-700 flex items-center gap-2">
                      <BellRing className="w-5 h-5" /> Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <NotificationsSummary />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Departments
                  </CardTitle>
                  <div className="flex gap-2">
                    {visibleDepartmentsCount > 3 && (
                      <Button
                        variant="outline"
                        onClick={handleShowLessDepartments}
                        className="text-sm"
                      >
                        Show Less
                      </Button>
                    )}
                    {hasMoreDepartments && (
                      <Button
                        variant="outline"
                        onClick={handleShowMoreDepartments}
                        className="text-sm"
                      >
                        Show More
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingDepartments ? (
                    <div className="text-center py-4 text-gray-500">Loading departments...</div>
                  ) : (Array.isArray(departments) && departments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {departmentsToShow.map((dept: any) => (
                        <div key={dept.id} className="p-4 border rounded-lg bg-gray-50">
                          <h3 className="font-semibold text-lg text-gray-800">{dept.name}</h3>
                          <p className="text-sm text-gray-600">
                            Courses: {dept._count?.courses || 0} • Faculty: {dept._count?.faculty || 0} • Students: {dept._count?.students || 0}
                          </p>
                          {dept.courses && dept.courses.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              <span className="font-medium">Top Courses:</span> {
                                dept.courses.slice(0, 2).map((course: any) => course.name).join(', ')
                              }
                              {dept.courses.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No departments found.</div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-purple-700 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DashboardCharts />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 