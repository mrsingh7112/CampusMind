'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface Faculty {
  id: string
  name: string
  department: string
  position: string
  createdAt: string
  email: string
  tokenId: string
}

export default function FacultyApprovalCard() {
  const [pendingFaculty, setPendingFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch pending faculty
  useEffect(() => {
    fetchPendingFaculty()
  }, [])

  const fetchPendingFaculty = async () => {
    try {
      const response = await fetch('/api/admin/faculty')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setPendingFaculty(data)
    } catch (err) {
      setError('Failed to load pending faculty')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (id: string, approved: boolean) => {
    try {
      const response = await fetch('/api/admin/faculty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved }),
      })

      if (!response.ok) throw new Error('Failed to update')

      // Refresh the list
      fetchPendingFaculty()
    } catch (err) {
      console.error(err)
      setError('Failed to update faculty status')
    }
  }

  if (loading) return <div className="text-center py-4">Loading...</div>
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>
  if (pendingFaculty.length === 0) {
    return <div className="text-gray-500 text-center py-4">No pending faculty approvals</div>
  }

  return (
    <div className="overflow-hidden">
      <div className="flow-root">
        <ul role="list" className="-my-5 divide-y divide-gray-200">
          {pendingFaculty.map((faculty) => (
            <li key={faculty.id} className="py-4">
              <div className="flex items-center space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{faculty.name}</p>
                  <p className="truncate text-sm text-gray-500">
                    {faculty.position} • {faculty.department}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {faculty.tokenId} • {faculty.email}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <p className="text-xs text-gray-500">
                    Applied {format(new Date(faculty.createdAt), 'yyyy-MM-dd')}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproval(faculty.id, true)}
                      className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(faculty.id, false)}
                      className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 