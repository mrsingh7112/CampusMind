'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Search, Users } from 'lucide-react'

interface Class {
  id: string
  name: string
  code: string
  semester: number
  studentCount: number
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchClasses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/faculty/classes')
      if (!response.ok) {
        throw new Error('Failed to fetch classes')
      }
      const data = await response.json()
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch classes',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [])

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Classes</h2>
          <p className="text-sm text-gray-500">
            View and manage your classes
          </p>
        </div>
        <Button onClick={fetchClasses}>
          Refresh
        </Button>
      </div>

      <div className="flex items-center space-x-2 max-w-sm">
        <Search className="w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search classes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center text-gray-500">
          Loading classes...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map(cls => (
            <div
              key={cls.id}
              className="p-6 space-y-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="text-lg font-semibold">{cls.name}</h3>
                <p className="text-sm text-gray-500">Code: {cls.code}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{cls.studentCount} students</span>
                </div>
                <div className="text-sm text-gray-600">
                  Semester {cls.semester}
                </div>
              </div>
            </div>
          ))}

          {filteredClasses.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12 text-gray-500">
              {searchQuery ? 'No classes found matching your search' : 'No classes found'}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 