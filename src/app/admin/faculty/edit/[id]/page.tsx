'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Faculty {
  id: string
  name: string
  email: string
  department: string
  position: string
  employeeId: string
  status: string
}

export default function EditFacultyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    employeeId: ''
  })

  // Fetch faculty data
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch(`/api/admin/faculty/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch faculty data')
        const data = await res.json()
        setFaculty(data)
        setFormData({
          name: data.name,
          email: data.email,
          department: data.department,
          position: data.position,
          employeeId: data.employeeId
        })
        setLoading(false)
      } catch (err) {
        console.error('Error fetching faculty:', err)
        setError('Failed to load faculty data')
        setLoading(false)
      }
    }
    fetchFaculty()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/admin/faculty/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed to update faculty')
      router.push('/admin/faculty')
    } catch (err) {
      console.error('Error updating faculty:', err)
      setError('Failed to update faculty')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-gray-600">Loading faculty data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <Button onClick={() => router.push('/admin/faculty')}>
          Back to Faculty List
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Edit Faculty</h1>
          <Button variant="outline" className="text-sm" onClick={() => router.push('/admin/faculty')}>Back to List</Button>
        </div>
        <hr className="mb-6" />
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <Input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
            <Input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Position</label>
            <Input type="text" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Employee ID</label>
            <Input type="text" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} className="w-full" required />
          </div>
          <div className="flex gap-4 mt-8">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/faculty')}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
} 