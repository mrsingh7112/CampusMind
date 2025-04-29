'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Student {
  id: string
  name: string
  email: string
  department: string
  semester: number
  courseId: number
  tokenId: string
  status: string
  course?: {
    name: string
    code: string
  }
}

interface Course {
  id: number
  name: string
  code: string
}

interface DashboardStats {
  totalStudents: number
  activeStudents: number
  departmentCounts: { [key: string]: number }
  semesterCounts: { [key: number]: number }
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    semester: '',
    courseId: '',
    tokenId: '',
    password: ''
  })
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    departmentCounts: {},
    semesterCounts: {}
  })

  // Function to calculate dashboard statistics
  const calculateStats = (studentList: Student[]) => {
    const stats: DashboardStats = {
      totalStudents: studentList.length,
      activeStudents: studentList.filter(s => s.status === 'ACTIVE').length,
      departmentCounts: {},
      semesterCounts: {}
    }

    studentList.forEach(s => {
      stats.departmentCounts[s.department] = (stats.departmentCounts[s.department] || 0) + 1
      stats.semesterCounts[s.semester] = (stats.semesterCounts[s.semester] || 0) + 1
    })

    setStats(stats)
  }

  // Fetch data function
  const fetchData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/courses')
      ])

      if (!studentsRes.ok || !coursesRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const studentsData = await studentsRes.json()
      const coursesData = await coursesRes.json()

      setStudents(studentsData)
      setCourses(coursesData)
      calculateStats(studentsData)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
      setLoading(false)
    }
  }

  // Initial load and setup interval for live updates
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          department: form.department,
          semester: parseInt(form.semester),
          courseId: parseInt(form.courseId),
          tokenId: form.tokenId || `STU${Math.floor(100000 + Math.random() * 900000)}`,
          password: form.password || Math.random().toString(36).slice(-8)
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add student')
      }

      setSuccess('Student added successfully!')
      setForm({
        name: '',
        email: '',
        department: '',
        semester: '',
        courseId: '',
        tokenId: '',
        password: ''
      })
      setShowAdd(false)
      fetchData() // Refresh data immediately
    } catch (err: any) {
      setError(err.message || 'Failed to add student')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/students?id=${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Failed to delete student')
      }

      setSuccess('Student deleted successfully!')
      fetchData() // Refresh data immediately
    } catch (err: any) {
      setError(err.message || 'Failed to delete student')
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.tokenId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Students</h3>
          <p className="text-3xl font-bold text-green-600">{stats.activeStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Departments</h3>
          <p className="text-3xl font-bold text-purple-600">{Object.keys(stats.departmentCounts).length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Semesters</h3>
          <p className="text-3xl font-bold text-orange-600">{Object.keys(stats.semesterCounts).length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Student Management</h2>
        <Button onClick={() => setShowAdd(true)}>Add Student</Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <Input
        placeholder="Search by name, email, or token ID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Add Student Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              placeholder="Full Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Input
              placeholder="Department"
              value={form.department}
              onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Semester</label>
            <Input
              type="number"
              placeholder="Semester"
              value={form.semester}
              onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
              required
              min="1"
              max="8"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Course</label>
            <select
              value={form.courseId}
              onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
              required
              className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">Add Student</Button>
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Students Table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 gap-4 p-4 font-medium bg-gray-50">
            <div>Name</div>
            <div>Email</div>
            <div>Department</div>
            <div>Semester</div>
            <div>Course</div>
            <div>Token ID</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {filteredStudents.map(student => (
              <div key={student.id} className="grid grid-cols-7 gap-4 p-4 items-center hover:bg-gray-50">
                <div>{student.name}</div>
                <div>{student.email}</div>
                <div>{student.department}</div>
                <div>{student.semester}</div>
                <div>{student.course ? `${student.course.code} - ${student.course.name}` : 'N/A'}</div>
                <div>{student.tokenId}</div>
                <div>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(student.id)}
                    className="text-sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department and Semester Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Department Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Department Statistics</h3>
          <div className="space-y-4">
            {Object.entries(stats.departmentCounts)
              .sort(([,a], [,b]) => b - a)
              .map(([dept, count]) => (
                <div key={dept} className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{dept}</span>
                  <span className="text-lg font-bold text-blue-600">{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Semester Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Semester Statistics</h3>
          <div className="space-y-4">
            {Object.entries(stats.semesterCounts)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([semester, count]) => (
                <div key={semester} className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Semester {semester}</span>
                  <span className="text-lg font-bold text-green-600">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
} 