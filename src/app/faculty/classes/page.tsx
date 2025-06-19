'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Search, Users, BookOpen, GraduationCap } from 'lucide-react'

interface Class {
  id: string
  name: string
  code: string
  semester: number
  studentCount: number
  course?: string
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
    (cls.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (cls.code?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-white to-blue-50 p-8 rounded-lg shadow-lg space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 drop-shadow-sm">My Classes</h1>
          <p className="text-lg text-gray-600">
            All subjects and courses assigned to you. Stay organized and manage your curriculum.
          </p>
        </div>
        <Button
          onClick={fetchClasses}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 px-6 py-2 rounded-lg"
        >
          Refresh Classes
        </Button>
      </div>

      <div className="relative flex items-center max-w-lg">
        <Search className="absolute left-3 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search classes by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out text-base"
        />
      </div>

      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center text-blue-500 text-xl font-medium animate-pulse">
          Loading classes...
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredClasses.map(cls => (
            <div
              key={cls.id}
              className="relative p-6 space-y-4 bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 opacity-50 blur-xl scale-125 z-0 transition-opacity duration-500 group-hover:opacity-75"></div>
              <div className="relative z-10 flex items-center space-x-4">
                <div className="flex-shrink-0 p-3 bg-blue-500 rounded-full shadow-lg group-hover:bg-blue-600 transition-colors duration-200">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-blue-900 group-hover:text-blue-700 transition-colors duration-200">{cls.name || 'Unnamed Class'}</h3>
              </div>
              <div className="relative z-10 space-y-2 text-gray-700">
                <div className="flex items-center space-x-2 text-base">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold">Course:</span> <span className="font-medium text-gray-800">{cls.course || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-base">
                  <span className="font-semibold">Code:</span> <span className="font-medium text-gray-800">{cls.code || 'N/A'}</span>
                  <span className="ml-4 font-semibold">Semester:</span> <span className="font-medium text-gray-800">{cls.semester}</span>
                </div>
                <div className="flex items-center space-x-2 text-base pt-1">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-gray-800">{cls.studentCount} students enrolled</span>
                </div>
              </div>
            </div>
          ))}

          {filteredClasses.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-md text-gray-600 text-xl font-semibold border border-dashed border-gray-300 animate-fade-in">
              {searchQuery ? 'No classes found matching your search. Try a different query!' : 'No classes found yet. Please add classes to view them here.'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}