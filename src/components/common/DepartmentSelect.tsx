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

interface DepartmentSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DepartmentSelect({ value, onChange, placeholder = "Select department" }: DepartmentSelectProps) {
  const { data: departments, error, isLoading } = useSWR('/api/admin/departments', fetcher, { refreshInterval: 3000 })

  if (error) return <div className="text-red-500">Failed to load departments</div>
  
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>Loading...</SelectItem>
        ) : departments && departments.length > 0 ? (
          departments.map((dept: any) => (
            <SelectItem key={dept.id} value={dept.id.toString()}>
              {dept.name} ({dept._count.courses} courses)
            </SelectItem>
          ))
        ) : (
          <SelectItem value="none" disabled>No departments found</SelectItem>
        )}
      </SelectContent>
    </Select>
  )
} 