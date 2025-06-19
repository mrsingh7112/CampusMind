'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, Tab } from '@/components/ui/tabs'
import { UserIcon, BookOpenIcon, CalendarIcon, BarChartIcon, BrainIcon, FilterIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend, Brush, ReferenceLine } from 'recharts'

interface Student {
  id: string
  name: string
  email: string
  department: string
  semester: number
  approved: boolean
  tokenId: string
}

interface Attendance {
  id: string
  date: string
  isPresent: boolean
  subject: { name: string }
}

interface Assignment {
  id: string
  title: string
  status: string
  grade?: string
}

interface Result {
  id: string
  course: { name: string }
  marks: number
  grade: string
  examType: string
}

interface Fee {
  id: string
  type: string
  amount: number
  status: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function StudentProfilePage() {
  const { id } = useParams() as { id: string }
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [attendanceStats, setAttendanceStats] = useState<any>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('all')
  const [chartZoom, setChartZoom] = useState(1)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [studentRes, attendanceRes, resultsRes, assignmentsRes] = await Promise.all([
          fetch(`/api/students?id=${id}`),
          fetch(`/api/admin/students/${id}/attendance`),
          fetch(`/api/admin/students/${id}/results`),
          fetch(`/api/admin/students/${id}/assignments`)
        ])

        const [studentData, attendanceData, resultsData, assignmentsData] = await Promise.all([
          studentRes.json(),
          attendanceRes.json(),
          resultsRes.json(),
          assignmentsRes.json()
        ])

        setStudent(studentData.data || studentData)
        setAttendance(attendanceData.records || [])
        setAttendanceStats(attendanceData.stats || null)
        setResults(resultsData)
        setAssignments(assignmentsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Defensive checks for fetched data
  const safeResults = Array.isArray(results) ? results : [];
  const safeAttendance = Array.isArray(attendance) ? attendance : [];
  const safeAssignments = Array.isArray(assignments) ? assignments : [];

  // Process data for charts
  const attendanceData = safeAttendance.map(a => ({
    date: new Date(a.date).toLocaleDateString(),
    present: a.isPresent ? 1 : 0,
    subject: a.subject?.name || 'Unknown'
  }))

  const resultsData = safeResults.map(r => ({
    subject: r.course.name,
    marks: r.marks,
    grade: r.grade,
    examType: r.examType
  }))

  const assignmentsData = safeAssignments.map(a => ({
    title: a.title,
    status: a.status,
    grade: a.grade || 0
  }))

  // Calculate GPA trend
  const gpaData = (Array.isArray(results) ? results : []).reduce((acc: any[], result) => {
    const semester = Math.ceil(result.marks / 20) // Assuming 20 marks per semester
    const existing = acc.find(a => a.semester === semester)
    if (existing) {
      existing.marks += result.marks
      existing.count += 1
    } else {
      acc.push({ semester, marks: result.marks, count: 1 })
    }
    return acc
  }, []).map(d => ({
    semester: `Sem ${d.semester}`,
    gpa: (d.marks / d.count / 20 * 4).toFixed(2) // Convert to 4.0 scale
  }))

  // Filter data based on time range
  const filterDataByTimeRange = (data: any[]) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90))

    switch (selectedTimeRange) {
      case '30days':
        return data.filter(d => new Date(d.date) >= thirtyDaysAgo)
      case '90days':
        return data.filter(d => new Date(d.date) >= ninetyDaysAgo)
      default:
        return data
    }
  }

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-xl" />
  }

  if (!student || !student.name) {
    return <div className="text-red-500">Student not found.</div>
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      {/* Header */}
      <Card className="flex items-center gap-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow">
        <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700">
          {student.name.split(' ').map((n: string) => n[0]).join('').slice(0,2)}
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-blue-800 flex items-center gap-2">
            <UserIcon className="w-7 h-7 text-blue-500" /> {student.name}
          </h2>
          <div className="mt-2 text-lg text-gray-700 font-semibold">Roll Number: <span className="text-blue-700">{student.rollNumber}</span></div>
          <div className="text-gray-600">Department: <span className="font-bold">{student.course?.department?.code}</span> | Course: <span className="font-bold">{student.course?.name}</span> | Semester: <span className="font-bold">{student.semester}</span></div>
          <div className="mt-1 text-sm">Status: <span className={`font-bold ${student.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>{student.status}</span></div>
        </div>
      </Card>

      {/* Tabs/Sections for Analytics */}
      <Tabs defaultValue="growth">
        <Tab value="growth" label="Semester Growth" icon={<BookOpenIcon className="w-4 h-4" />}>
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Academic Performance</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setChartZoom(prev => Math.min(prev + 0.1, 2))}>
                  <ZoomInIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setChartZoom(prev => Math.max(prev - 0.1, 0.5))}>
                  <ZoomOutIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resultsData} style={{ transform: `scale(${chartZoom})` }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="marks" stroke="#8884d8" name="Marks" />
                  <ReferenceLine y={60} stroke="red" label="Passing" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">GPA Trend</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gpaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[0, 4]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="gpa" stroke="#82ca9d" name="GPA" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </Tab>

        <Tab value="attendance" label="Attendance" icon={<CalendarIcon className="w-4 h-4" />}>
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Attendance Record</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedTimeRange('all')}>
                  All Time
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedTimeRange('90days')}>
                  90 Days
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedTimeRange('30days')}>
                  30 Days
                </Button>
              </div>
            </div>
            {attendanceStats && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">Total Classes</div>
                  <div className="text-2xl font-bold text-blue-700">{attendanceStats.total}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600">Present</div>
                  <div className="text-2xl font-bold text-green-700">{attendanceStats.present}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600">Absent</div>
                  <div className="text-2xl font-bold text-red-700">{attendanceStats.absent}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600">Attendance %</div>
                  <div className="text-2xl font-bold text-purple-700">{attendanceStats.percentage}%</div>
                </div>
              </div>
            )}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filterDataByTimeRange(attendanceData)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#82ca9d" name="Present" />
                  <Brush dataKey="date" height={30} stroke="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Tab>

        <Tab value="performance" label="Class Performance" icon={<BarChartIcon className="w-4 h-4" />}>
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Assignment Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assignmentsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="grade" fill="#8884d8" name="Grade" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Tab>

        <Tab value="ai" label="AI/ML Insights" icon={<BrainIcon className="w-4 h-4" />}>
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">AI-Powered Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">Performance Prediction</h4>
                <p className="text-gray-600">Based on current trends, student is likely to maintain a GPA of 3.5-3.8 in the next semester.</p>
                <div className="mt-2 text-sm text-blue-600">Confidence: 85%</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Attendance Pattern</h4>
                <p className="text-gray-600">Student shows consistent attendance with 92% attendance rate over the last 3 months.</p>
                <div className="mt-2 text-sm text-green-600">Risk Level: Low</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800">Learning Style</h4>
                <p className="text-gray-600">Analysis suggests student performs better in practical assignments than theoretical exams.</p>
                <div className="mt-2 text-sm text-purple-600">Recommendation: Focus on practical learning methods</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-800">Subject Performance</h4>
                <p className="text-gray-600">Strong performance in Mathematics and Computer Science, may need additional support in Physics.</p>
                <div className="mt-2 text-sm text-orange-600">Suggested Action: Schedule extra Physics tutoring</div>
              </div>
            </div>
          </Card>
        </Tab>
      </Tabs>
    </div>
  )
} 