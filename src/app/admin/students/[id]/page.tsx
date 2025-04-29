'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // For adding/editing results and fees
  const [newResult, setNewResult] = useState({ course: '', marks: '', grade: '', examType: '' })
  const [newFee, setNewFee] = useState({ type: '', amount: '', status: '' })

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      // Student info
      const res = await fetch(`/api/admin/users/${id}`)
      const data = await res.json()
      setStudent(data.user)
      // Attendance
      const attRes = await fetch(`/api/admin/students/${id}/attendance`)
      setAttendance(await attRes.json())
      // Assignments
      const asgRes = await fetch(`/api/admin/students/${id}/assignments`)
      setAssignments(await asgRes.json())
      // Results
      const resRes = await fetch(`/api/admin/students/${id}/results`)
      setResults(await resRes.json())
      // Fees
      const feeRes = await fetch(`/api/admin/students/${id}/fees`)
      setFees(await feeRes.json())
    } catch (err) {
      setError('Failed to load student data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Handlers for adding results and fees (API endpoints to be implemented)
  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement POST to /api/admin/students/[id]/results
    setNewResult({ course: '', marks: '', grade: '', examType: '' })
    fetchAll()
  }
  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement POST to /api/admin/students/[id]/fees
    setNewFee({ type: '', amount: '', status: '' })
    fetchAll()
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>
  if (!student) return <div className="text-gray-500 text-center py-8">Student not found</div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Student Details</h2>
      <div className="bg-white p-4 rounded shadow space-y-2">
        <div><b>Name:</b> {student.name}</div>
        <div><b>Email:</b> {student.email}</div>
        <div><b>Department:</b> {student.department}</div>
        <div><b>Semester:</b> {student.semester}</div>
        <div><b>Token ID:</b> {student.tokenId}</div>
        <div><b>Status:</b> {student.approved ? 'Approved' : 'Pending'}</div>
      </div>
      {/* Attendance Section (read-only, per subject) */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Attendance (per subject)</h3>
        <ul className="divide-y">
          {attendance.map(a => (
            <li key={a.id} className="py-2 flex justify-between">
              <span>{a.date} - {a.subject?.name || 'N/A'}</span>
              <span className={a.isPresent ? 'text-green-600' : 'text-red-600'}>{a.isPresent ? 'Present' : 'Absent'}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Assignments Section (read-only) */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Assignments</h3>
        <ul className="divide-y">
          {assignments.map(a => (
            <li key={a.id} className="py-2 flex justify-between">
              <span>{a.title}</span>
              <span>{a.status}{a.grade ? ` (Grade: ${a.grade})` : ''}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Results Section (editable) */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Exam Results</h3>
        <ul className="divide-y mb-4">
          {results.map(r => (
            <li key={r.id} className="py-2 flex justify-between">
              <span>{r.course?.name || 'N/A'} ({r.examType})</span>
              <span>Marks: {r.marks} | Grade: {r.grade}</span>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddResult} className="flex flex-wrap gap-2 items-center">
          <Input placeholder="Course" value={newResult.course} onChange={e => setNewResult(r => ({ ...r, course: e.target.value }))} required className="w-32" />
          <Input placeholder="Exam Type" value={newResult.examType} onChange={e => setNewResult(r => ({ ...r, examType: e.target.value }))} required className="w-32" />
          <Input placeholder="Marks" value={newResult.marks} onChange={e => setNewResult(r => ({ ...r, marks: e.target.value }))} required className="w-20" />
          <Input placeholder="Grade" value={newResult.grade} onChange={e => setNewResult(r => ({ ...r, grade: e.target.value }))} required className="w-20" />
          <Button type="submit">Add Result</Button>
        </form>
      </div>
      {/* Fees Section (editable) */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Fees</h3>
        <ul className="divide-y mb-4">
          {fees.map(f => (
            <li key={f.id} className="py-2 flex justify-between">
              <span>{f.type}</span>
              <span>{f.amount} ({f.status})</span>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddFee} className="flex flex-wrap gap-2 items-center">
          <Input placeholder="Type" value={newFee.type} onChange={e => setNewFee(f => ({ ...f, type: e.target.value }))} required className="w-32" />
          <Input placeholder="Amount" value={newFee.amount} onChange={e => setNewFee(f => ({ ...f, amount: e.target.value }))} required className="w-20" />
          <Input placeholder="Status" value={newFee.status} onChange={e => setNewFee(f => ({ ...f, status: e.target.value }))} required className="w-20" />
          <Button type="submit">Add Fee</Button>
        </form>
      </div>
      {/* PDF Upload/ML Extraction Section */}
      <div className="bg-white p-4 rounded shadow mt-6">
        <h3 className="text-lg font-semibold mb-2">Upload PDF for ML Extraction</h3>
        <Input type="file" accept="application/pdf" />
        <Button className="mt-2">Extract & Auto-Fill</Button>
      </div>
    </div>
  )
} 