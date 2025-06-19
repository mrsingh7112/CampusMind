'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { UserIcon, MailIcon, BookOpenIcon, GraduationCapIcon, CheckCircleIcon, XCircleIcon, SearchIcon, PlusIcon, EditIcon, TrashIcon, BanIcon, RefreshCwIcon, AlertTriangleIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

interface Student {
  id: string
  name: string
  email: string
  semester: number
  courseId: number
  rollNumber: string
  status: string
  course?: {
    name: string
    code: string
    department?: {
      id: string
      name: string
      code: string
    }
  }
  deactivatedFrom?: string
  deactivatedTo?: string
  currentSemester?: number
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

interface DeactivateModalState {
  open: boolean;
  student: Student | null;
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
    semester: '',
    courseId: '',
    rollNumber: '',
    password: '',
    phoneNumber: ''
  })
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    departmentCounts: {},
    semesterCounts: {}
  })
  const [deactivateModal, setDeactivateModal] = useState<DeactivateModalState>({ open: false, student: null })
  const [deactivateFrom, setDeactivateFrom] = useState('')
  const [deactivateTo, setDeactivateTo] = useState('')
  const [deactivateLoading, setDeactivateLoading] = useState(false)
  const [sortField, setSortField] = useState<'semester' | 'department' | 'course' | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();

  // Function to calculate dashboard statistics
  const calculateStats = (studentList: Student[]) => {
    const stats: DashboardStats = {
      totalStudents: studentList.length,
      activeStudents: studentList.filter(s => s.status === 'ACTIVE').length,
      departmentCounts: {},
      semesterCounts: {}
    }

    studentList.forEach(s => {
      const deptName = s.course?.department?.name || 'Unknown'
      stats.departmentCounts[deptName] = (stats.departmentCounts[deptName] || 0) + 1
      const semester = s.currentSemester || s.semester;
      stats.semesterCounts[semester] = (stats.semesterCounts[semester] || 0) + 1
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
          courseId: parseInt(form.courseId),
          semester: parseInt(form.semester),
          rollNumber: form.rollNumber,
          password: form.password || Math.random().toString(36).slice(-8),
          phoneNumber: form.phoneNumber || null
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
        semester: '',
        courseId: '',
        rollNumber: '',
        password: '',
        phoneNumber: ''
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

  const handleDeactivate = (student: Student) => {
    setDeactivateModal({ open: true, student })
    setDeactivateFrom('')
    setDeactivateTo('')
  }

  const handleDeactivateSubmit = async () => {
    if (!deactivateModal.student) return
    setDeactivateLoading(true)
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: deactivateModal.student.id,
          status: 'INACTIVE',
          deactivatedFrom: deactivateFrom,
          deactivatedTo: deactivateTo
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to deactivate student')
      
      if (data.permanentlyDeactivated) {
        setSuccess('Student permanently deactivated and removed from the system')
      } else if (data.rusticated) {
        setSuccess('Student rusticated and removed from the system after 3 deactivations')
      } else {
        setSuccess('Student deactivated successfully')
      }
      
      fetchData()
      setDeactivateModal({ open: false, student: null })
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate student')
    } finally {
      setDeactivateLoading(false)
    }
  }

  const handleReactivate = async (student: Student) => {
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          status: 'ACTIVE'
        })
      })
      if (!res.ok) throw new Error('Failed to reactivate student')
      fetchData()
    } catch (err) {
      alert('Failed to reactivate student')
    }
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  )

  // Sorting logic
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortField) return 0;
    let aValue, bValue;
    if (sortField === 'semester') {
      aValue = a.currentSemester || a.semester || 0;
      bValue = b.currentSemester || b.semester || 0;
    } else if (sortField === 'department') {
      aValue = a.course?.department?.name || '';
      bValue = b.course?.department?.name || '';
    } else if (sortField === 'course') {
      aValue = a.course?.name || '';
      bValue = b.course?.name || '';
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-xl shadow flex items-center gap-4">
          <UserIcon className="w-8 h-8 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
            <p className="text-3xl font-bold text-blue-700">{stats.totalStudents}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-xl shadow flex items-center gap-4">
          <CheckCircleIcon className="w-8 h-8 text-green-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Active Students</h3>
            <p className="text-3xl font-bold text-green-700">{stats.activeStudents}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-6 rounded-xl shadow flex items-center gap-4">
          <GraduationCapIcon className="w-8 h-8 text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Departments</h3>
            <p className="text-3xl font-bold text-purple-700">{Object.keys(stats.departmentCounts).length}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-6 rounded-xl shadow flex items-center gap-4">
          <BookOpenIcon className="w-8 h-8 text-orange-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Semesters</h3>
            <p className="text-3xl font-bold text-orange-700">{Object.keys(stats.semesterCounts).length}</p>
          </div>
        </div>
      </div>

      {/* Search and Add Student Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="relative w-full md:w-1/2">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by name, email, or roll number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="font-semibold text-gray-700">Sort by:</label>
          <select
            className="border rounded px-2 py-1"
            value={sortField}
            onChange={e => setSortField(e.target.value as any)}
          >
            <option value="">None</option>
            <option value="semester">Semester</option>
            <option value="department">Department</option>
            <option value="course">Course</option>
          </select>
          <button
            className="ml-2 px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100"
            onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
            title="Toggle sort direction"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
        <Button className="flex items-center gap-2 px-6 py-2 rounded-lg text-base font-semibold" onClick={() => setShowAdd(true)}>
          <PlusIcon className="w-5 h-5" /> Add Student
        </Button>
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

      {/* Add Student Form */}
      {showAdd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="max-w-2xl w-full mx-auto p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-lg border border-blue-100 relative">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6 flex items-center gap-2 text-blue-700">
              <UserIcon className="w-8 h-8 text-blue-500" /> Add New Student
            </h2>
            <form onSubmit={handleAdd} className="space-y-5">
              <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <div>
                <label className="block mb-1 font-semibold text-blue-800">Course</label>
                <div className="flex items-center gap-2">
                  <select
                    className="w-full border-2 border-blue-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 bg-white"
                    value={form.courseId}
                    onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map((course: any) => (
                      <option key={course.id} value={course.id}>{course.name} ({course.department?.code})</option>
                    ))}
                  </select>
                  <BookOpenIcon className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <Input placeholder="Semester" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} required />
              <Input placeholder="Phone Number (optional)" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg rounded-lg">{loading ? 'Adding...' : 'Add Student'}</Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
              </div>
            </form>
            {success && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <div><b>Roll Number:</b> {success.rollNumber}</div>
                <div><b>Password:</b> {success.password}</div>
                <div className="text-xs text-gray-500 mt-2">Share these credentials with the student.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="border rounded-xl overflow-x-auto bg-white shadow">
          <div className="min-w-[1000px]">
            <div className="grid grid-cols-9 gap-4 p-4 font-semibold bg-gray-50 sticky top-0 z-10 rounded-t-xl">
              <div>Name</div>
              <div>Email</div>
              <div>Department</div>
              <div>Semester</div>
              <div>Course</div>
              <div>Student ID</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {sortedStudents.map(student => (
                <div
                  key={student.id}
                  className="grid grid-cols-9 gap-4 p-4 items-center hover:bg-blue-50 cursor-pointer transition"
                  onClick={() => router.push(`/admin/students/${student.id}`)}
                >
                  {/* Avatar with initials */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">
                      {student.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    <span className="font-medium">{student.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4 text-gray-400" />
                    <span className="truncate max-w-[140px]">{student.email}</span>
                  </div>
                  <div>
                    {student.course?.department?.code ? (
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                        {student.course.department.code}
                      </span>
                    ) : 'N/A'}
                  </div>
                  <div>
                    <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                      {student.currentSemester || student.semester}
                    </span>
                  </div>
                  <div>
                    {student.course ? (
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        {student.course.code} - {student.course.name}
                      </span>
                    ) : 'N/A'}
                  </div>
                  <div>
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                      {student.rollNumber}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 'ACTIVE' ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                      {student.status}
                    </span>
                    {student.status === 'INACTIVE' && student.deactivatedFrom && student.deactivatedTo && (
                      <div className="text-xs text-gray-500 mt-1">
                        {student.deactivatedTo === '9999-12-31'
                          ? 'Rusticated: PERMANENT'
                          : `Rusticated: ${format(new Date(student.deactivatedFrom), 'yyyy-MM-dd')} to ${format(new Date(student.deactivatedTo), 'yyyy-MM-dd')}`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    {student.status === 'ACTIVE' ? (
                      <button
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition"
                        title="Deactivate"
                        onClick={() => handleDeactivate(student)}
                      >
                        <BanIcon className="w-4 h-4" /> Deactivate
                      </button>
                    ) : (
                      <button
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 font-semibold text-sm transition"
                        title="Reactivate"
                        onClick={() => handleReactivate(student)}
                      >
                        <RefreshCwIcon className="w-4 h-4" /> Reactivate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

      {/* Deactivate Modal */}
      {deactivateModal.open && deactivateModal.student && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Deactivate Student</h2>
            {/* Quick-select buttons */}
            <div className="flex gap-2 mb-4">
              <Button type="button" variant="outline" onClick={() => {
                const today = new Date();
                setDeactivateFrom(today.toISOString().slice(0, 10));
                const to = new Date(today);
                to.setDate(today.getDate() + 6);
                setDeactivateTo(to.toISOString().slice(0, 10));
              }}>6 days</Button>
              <Button type="button" variant="outline" onClick={() => {
                const today = new Date();
                setDeactivateFrom(today.toISOString().slice(0, 10));
                const to = new Date(today);
                to.setDate(today.getDate() + 15);
                setDeactivateTo(to.toISOString().slice(0, 10));
              }}>15 days</Button>
              <Button type="button" variant="outline" onClick={() => {
                const today = new Date();
                setDeactivateFrom(today.toISOString().slice(0, 10));
                const to = new Date(today);
                to.setMonth(today.getMonth() + 1);
                setDeactivateTo(to.toISOString().slice(0, 10));
              }}>1 month</Button>
              <Button type="button" variant="destructive" onClick={() => {
                const today = new Date();
                setDeactivateFrom(today.toISOString().slice(0, 10));
                setDeactivateTo('9999-12-31');
              }}>Permanent</Button>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">From</label>
              <Input type="date" value={deactivateFrom} onChange={e => setDeactivateFrom(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">To</label>
              <Input type="date" value={deactivateTo} onChange={e => setDeactivateTo(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeactivateModal({ open: false, student: null })}>Cancel</Button>
              <Button onClick={handleDeactivateSubmit} disabled={deactivateLoading || !deactivateFrom || !deactivateTo}>
                {deactivateLoading ? 'Deactivating...' : 'Deactivate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 