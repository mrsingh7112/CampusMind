'use client'
import { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, BookOpen, Layers } from 'lucide-react'
import { toast } from 'sonner'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function generateRollNumber() {
  return 'STU' + Math.floor(100000 + Math.random() * 900000)
}
function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'
  let pwd = ''
  for (let i = 0; i < 8; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pwd
}

export default function AddStudentPage() {
  const [form, setForm] = useState({ name: '', email: '', courseId: '', semester: '', rollNumber: '', password: '', phoneNumber: '' })
  const [loading, setLoading] = useState(false)
  const [showCreds, setShowCreds] = useState<{rollNumber: string, password: string} | null>(null)

  // Fetch courses
  const { data: courses, isLoading: loadingCourses } = useSWR('/api/admin/courses', fetcher)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setShowCreds(null)
    const rollNumber = generateRollNumber()
    const password = generatePassword()
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, courseId: Number(form.courseId), rollNumber, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || data.details || 'Failed to add student')
        return
      }
      setShowCreds({ rollNumber, password })
      toast.success('Student added successfully!')
      setForm({ name: '', email: '', courseId: '', semester: '', rollNumber: '', password: '', phoneNumber: '' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-lg mt-10 border border-blue-100">
      <h2 className="text-3xl font-extrabold mb-6 flex items-center gap-2 text-blue-700">
        <UserPlus className="w-8 h-8 text-blue-500" /> Add New Student
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
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
              {courses && courses.length > 0 && courses.map((course: any) => (
                <option key={course.id} value={course.id}>{course.name} ({course.department?.name})</option>
              ))}
            </select>
            <BookOpen className="w-6 h-6 text-purple-400" />
          </div>
        </div>
        <Input placeholder="Semester" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} required />
        <Input placeholder="Phone Number (optional)" value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
        <Button type="submit" disabled={loading} className="w-full py-3 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg rounded-lg">{loading ? 'Adding...' : 'Add Student'}</Button>
      </form>
      {showCreds && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <div><b>Roll Number:</b> {showCreds.rollNumber}</div>
          <div><b>Password:</b> {showCreds.password}</div>
          <div className="text-xs text-gray-500 mt-2">Share these credentials with the student.</div>
        </div>
      )}
    </div>
  )
} 