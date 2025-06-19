'use client'
import { useEffect, useState } from 'react'
import { getSession } from 'next-auth/react'
import { format, parseISO } from 'date-fns'
import { CalendarDays, Bell, BrainCircuit, BookOpen, Calendar, ClipboardCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentDashboard() {
  const [attendance, setAttendance] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [aiInsight, setAiInsight] = useState('Loading personalized insights...')
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([])
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalClasses: 0,
    totalAssignments: 0,
    attendancePercentage: 0,
  })

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const session = await getSession()
      const id = session?.user?.id
      if (!id) {
        setAiInsight('Unable to load student data.')
        setLoading(false)
        return
      }
      try {
        const [attendanceRes, assignmentsRes, resultsRes, timetableRes, notificationsRes] = await Promise.all([
          fetch(`/api/admin/students/${id}/attendance`),
          fetch(`/api/admin/students/${id}/assignments`),
          fetch(`/api/admin/students/${id}/results`),
          fetch(`/api/student/timetable`),
          fetch(`/api/student/notifications`),
        ])
        const attendanceData = await attendanceRes.json()
        const assignmentsData = await assignmentsRes.json()
        const resultsData = await resultsRes.json()
        const timetableData = await timetableRes.json()
        const notificationsData = await notificationsRes.json()

        setAttendance(attendanceData.stats)
        setAssignments(assignmentsData)
        setResults(resultsData)

        const now = new Date();
        const currentDay = now.getDay(); // Sunday - 0, Monday - 1, etc.
        const currentTime = format(now, 'HH:mm');

        // Filter upcoming classes for today and sort them
        const filteredClasses = timetableData.filter((slot: any) => {
          const [startHour, startMinute] = slot.startTime.split(':').map(Number);
          const slotTime = new Date();
          slotTime.setHours(startHour, startMinute, 0, 0);

          // Convert string day of week to number for comparison
          const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const slotDay = daysOfWeek.indexOf(slot.dayOfWeek);

          return slotDay === currentDay && slotTime.getTime() > now.getTime();
        }).sort((a: any, b: any) => {
          // Sort by start time for upcoming classes
          const timeA = parseISO(`2000-01-01T${a.startTime}:00`).getTime();
          const timeB = parseISO(`2000-01-01T${b.startTime}:00`).getTime();
          return timeA - timeB;
        });

        setUpcomingClasses(filteredClasses.slice(0, 3)); // Show top 3 upcoming classes
        setRecentNotifications(notificationsData.slice(0, 3)); // Show top 3 recent notifications

        // --- Simple AI Model ---
        // Features: attendance %, overdue assignments, average grade
        const attendancePct = attendanceData.stats?.percentage || 0
        const overdueAssignments = assignmentsData.filter((a: any) => a.status === 'OVERDUE').length
        const avgGrade = resultsData.length > 0 ? (resultsData.reduce((sum: number, r: any) => sum + (parseFloat(r.grade) || 0), 0) / resultsData.length) : null
        let risk = 'Low'
        let reason = []
        if (attendancePct < 75) {
          risk = 'High'
          reason.push('Low attendance')
        } else if (attendancePct < 85) {
          risk = 'Medium'
          reason.push('Moderate attendance')
        }
        if (overdueAssignments > 0) {
          risk = risk === 'High' ? 'High' : 'Medium'
          reason.push(`${overdueAssignments} overdue assignments`)
        }
        if (avgGrade !== null && avgGrade < 6) {
          risk = 'High'
          reason.push('Low grades')
        }
        let performance = 'Good'
        if (risk === 'High') performance = 'At Risk'
        else if (risk === 'Medium') performance = 'Needs Attention'
        setAiInsight(
          `Performance: ${performance}\nDetain Risk: ${risk}\n${reason.length ? 'Reasons: ' + reason.join(', ') : 'Keep up the good work!'}`
        )
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
        setAiInsight('Failed to load insights.')
        setUpcomingClasses([]);
        setRecentNotifications([]);
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/student/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Student Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendancePercentage}%</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
            <CalendarDays className="w-6 h-6" /> Attendance Summary
          </h2>
          <div className="text-3xl font-extrabold text-blue-900 text-center py-4">
            {loading ? 'Loading...' : attendance ? `${attendance.percentage || 0}% present` : 'N/A'}
          </div>
          {attendance && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Total classes: {attendance.totalClasses || 0}, Attended: {attendance.attendedClasses || 0}
            </p>
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
            <CalendarDays className="w-6 h-6" /> Upcoming Classes
          </h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : upcomingClasses.length > 0 ? (
            <ul className="space-y-3">
              {upcomingClasses.map((cls: any) => (
                <li key={cls.id} className="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-200 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-purple-800">{cls.subject?.code} - {cls.subject?.name}</p>
                    <p className="text-sm text-gray-600">{format(parseISO(`2000-01-01T${cls.startTime}:00`), 'hh:mm a')} - {format(parseISO(`2000-01-01T${cls.endTime}:00`), 'hh:mm a')}</p>
                  </div>
                  <p className="text-sm text-gray-500">{cls.room?.name || 'N/A'}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500">No upcoming classes for today.</div>
          )}
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
          <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6" /> AI Insights
          </h2>
          <div className="text-lg text-green-800 whitespace-pre-line leading-relaxed">
            {loading ? 'Loading insights...' : aiInsight}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8 border border-red-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
        <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6" /> Recent Notifications
        </h2>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : recentNotifications.length > 0 ? (
          <ul className="space-y-3">
            {recentNotifications.map((notif: any) => (
              <li key={notif.id} className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-200">
                <p className="font-semibold text-red-800">{notif.title}</p>
                <p className="text-sm text-gray-600">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{format(parseISO(notif.createdAt), 'MMM d, yyyy hh:mm a')}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500">No recent notifications.</div>
        )}
      </div>
    </div>
  )
} 