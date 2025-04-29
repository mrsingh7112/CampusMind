'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'

interface Department {
  id: number
  name: string
  courses: any[]
  _count: {
    courses: number
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DepartmentStatsCard() {
  const { data: departments, error, isLoading } = useSWR<Department[]>(
    '/api/admin/departments',
    fetcher,
    { refreshInterval: 3000 }
  )

  if (isLoading) return <div className="text-center py-4">Loading...</div>
  if (error) return <div className="text-red-500 text-center py-4">Failed to load departments</div>
  if (!departments || departments.length === 0) {
    return <div className="text-gray-500 text-center py-4">No departments found</div>
  }

  return (
    <div className="overflow-hidden">
      <div className="flow-root">
        <ul role="list" className="-my-5 divide-y divide-gray-200">
          {departments.map((dept) => (
            <li key={dept.id} className="py-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {dept.name}
                  </p>
                  <div className="mt-1 flex text-xs text-gray-500">
                    <p>{dept._count.courses} Courses</p>
                    <span className="mx-2">•</span>
                    <p>{dept.courses.reduce((total, course) => total + (course.subjects?.length || 0), 0)} Subjects</p>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                    Active
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