'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CourseSelectProps {
  departmentId: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CourseSelect({ departmentId, value, onChange, placeholder = "Select course" }: CourseSelectProps) {
  const { data: courses, error, isLoading } = useSWR(
    departmentId ? `/api/admin/courses?departmentId=${departmentId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  )

  if (error) return <div className="text-red-500">Failed to load courses</div>
  if (!departmentId) return (
    <Select disabled>
      <SelectTrigger>
        <SelectValue placeholder="Select department first" />
      </SelectTrigger>
    </Select>
  )
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>Loading...</SelectItem>
        ) : courses && courses.length > 0 ? (
          courses.map((course: any) => (
            <SelectItem key={course.id} value={course.id.toString()}>
              {course.name} ({course.code})
            </SelectItem>
          ))
        ) : (
          <SelectItem value="none" disabled>No courses found</SelectItem>
        )}
      </SelectContent>
    </Select>
  )
} 