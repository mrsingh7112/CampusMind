'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Department {
  id: string
  name: string
}

interface Course {
  id: string
  code: string
  name: string
  departmentId: string
  department: Department
}

export default function AdminCoursesPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', departmentId: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', code: '', departmentId: '' })
  const [filterDept, setFilterDept] = useState('')

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [filterDept])

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/admin/departments')
      const data = await res.json()
      setDepartments(data)
    } catch (err) {
      setDepartments([])
    }
  }

  const fetchCourses = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/courses'
      if (filterDept) url += `?departmentId=${filterDept}`
      const res = await fetch(url)
      const data = await res.json()
      setCourses(data)
    } catch (err) {
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setForm({ name: '', code: '', departmentId: '' })
      setShowAdd(false)
      fetchCourses()
    } catch (err) {
      setError('Failed to add course')
    }
  }

  const handleEdit = async (id: string) => {
    try {
      await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      setEditId(null)
      setEditForm({ name: '', code: '', departmentId: '' })
      fetchCourses()
    } catch (err) {
      setError('Failed to update course')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      fetchCourses()
    } catch (err) {
      setError('Failed to delete course')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Courses</h2>
        <Button onClick={() => setShowAdd(true)}>Add Course</Button>
      </div>
      <div className="flex space-x-4 items-center">
        <span>Filter by Department:</span>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border rounded px-2 py-1">
          <option value="">All</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      {showAdd && (
        <form onSubmit={handleAdd} className="space-y-4 bg-white p-4 rounded shadow">
          <Input placeholder="Course Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <Input placeholder="Course Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required />
          <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} required className="w-full border rounded px-3 py-2">
            <option value="">Select Department</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
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
            <div>Department</div>
            <div>Actions</div>
          </div>
          <div className="divide-y">
            {courses.map(c => (
              <div key={c.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                {editId === c.id ? (
                  <>
                    <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="col-span-1" />
                    <Input value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))} className="col-span-1" />
                    <select value={editForm.departmentId} onChange={e => setEditForm(f => ({ ...f, departmentId: e.target.value }))} className="w-full border rounded px-3 py-2">
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <div className="flex space-x-2 col-span-1">
                      <Button onClick={() => handleEdit(c.id)}>Save</Button>
                      <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>{c.name}</div>
                    <div>{c.code}</div>
                    <div>{c.department?.name}</div>
                    <div className="flex space-x-2">
                      <Button onClick={() => { setEditId(c.id); setEditForm({ name: c.name, code: c.code, departmentId: c.departmentId }); }}>Edit</Button>
                      <Button variant="destructive" onClick={() => handleDelete(c.id)}>Delete</Button>
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