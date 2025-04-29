import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Course {
  id: string
  name: string
}

interface Subject {
  id: string
  name: string
  code: string
  courseId: string
  course: Course
}

export default function AdminSubjectsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', courseId: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', code: '', courseId: '' })
  const [filterCourse, setFilterCourse] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    fetchSubjects()
  }, [filterCourse])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses')
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      setCourses([])
    }
  }

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/subjects'
      if (filterCourse) url += `?courseId=${filterCourse}`
      const res = await fetch(url)
      const data = await res.json()
      setSubjects(data)
    } catch (err) {
      setError('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setForm({ name: '', code: '', courseId: '' })
      setShowAdd(false)
      fetchSubjects()
    } catch (err) {
      setError('Failed to add subject')
    }
  }

  const handleEdit = async (id: string) => {
    try {
      await fetch(`/api/admin/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      setEditId(null)
      setEditForm({ name: '', code: '', courseId: '' })
      fetchSubjects()
    } catch (err) {
      setError('Failed to update subject')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' })
      fetchSubjects()
    } catch (err) {
      setError('Failed to delete subject')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Subjects</h2>
        <Button onClick={() => setShowAdd(true)}>Add Subject</Button>
      </div>
      <div className="flex space-x-4 items-center">
        <span>Filter by Course:</span>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {showAdd && (
        <form onSubmit={handleAdd} className="space-y-4 bg-white p-4 rounded shadow">
          <Input placeholder="Subject Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input placeholder="Subject Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
          <select value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} required className="w-full border rounded px-3 py-2">
            <option value="">Select Course</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex space-x-2">
            <Button type="submit">Add</Button>
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </form>
      )}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="border rounded-lg">
          <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b bg-gray-50">
            <div>Name</div>
            <div>Code</div>
            <div>Course</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {subjects.map(s => (
              <div key={s.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                {editId === s.id ? (
                  <>
                    <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="col-span-1" />
                    <Input value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))} className="col-span-1" />
                    <select value={editForm.courseId} onChange={e => setEditForm(f => ({ ...f, courseId: e.target.value }))} className="w-full border rounded px-3 py-2">
                      <option value="">Select Course</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="flex space-x-2 col-span-1">
                      <Button onClick={() => handleEdit(s.id)}>Save</Button>
                      <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>{s.name}</div>
                    <div>{s.code}</div>
                    <div>{s.course?.name}</div>
                    <div className="flex space-x-2">
                      <Button onClick={() => { setEditId(s.id); setEditForm({ name: s.name, code: s.code, courseId: s.courseId }); }}>Edit</Button>
                      <Button variant="destructive" onClick={() => handleDelete(s.id)}>Delete</Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 