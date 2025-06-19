'use client'

import { useEffect, useState } from 'react'

interface Stat {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
}

export default function StudentStatsCard() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/student-stats')
      if (!res.ok) throw new Error('Failed to fetch student stats')
      const data = await res.json()
      // Transform the API response object into an array of stats
      const statsArray: Stat[] = [
        { label: 'Total Students', value: data.totalStudents },
        { label: 'Active Students', value: data.activeStudents },
        { label: 'New Enrollments (30d)', value: data.newEnrollments },
        // Optionally add more, e.g. department/semester breakdowns
      ]
      setStats(statsArray)
    } catch (err) {
      setError('Failed to load student stats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-4">Loading...</div>
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>
  if (stats.length === 0) {
    return <div className="text-gray-500 text-center py-4">No student statistics found</div>
  }

  return (
    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 shadow sm:px-6 sm:pt-6"
        >
          <dt>
            <p className="truncate text-sm font-medium text-gray-500">{stat.label}</p>
          </dt>
          <dd className="flex items-baseline pb-6">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            {stat.change && (
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.change}
                <svg
                  className={`h-5 w-5 flex-shrink-0 self-center ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d={
                      stat.trend === 'up'
                        ? 'M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z'
                        : 'M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z'
                    }
                    clipRule="evenodd"
                  />
                </svg>
              </p>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
} 