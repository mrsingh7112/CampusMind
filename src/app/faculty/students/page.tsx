'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Users, GraduationCap, Mail } from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  studentId: string
  enrollmentYear: number
  semester: number
}

interface Subject {
  id: string
  name: string
  code: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/faculty/classes')
        if (!response.ok) {
          throw new Error('Failed to fetch subjects')
        }
        const data = await response.json()
        setSubjects(data)
      } catch (error) {
        console.error('Error fetching subjects:', error)
        toast({
          title: 'Error',
          description: 'Failed to load subjects for class selection',
          variant: 'destructive'
        })
        setSubjects([])
      } finally {
        setLoadingSubjects(false)
      }
    }
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      setLoadingStudents(true)
      const fetchStudents = async () => {
        try {
          const response = await fetch(`/api/faculty/class/${selectedClassId}/students`)
          if (!response.ok) {
            throw new Error('Failed to fetch students')
          }
          const data = await response.json()
          setStudents(data)
        } catch (error) {
          console.error('Error fetching students:', error)
          toast({
            title: 'Error',
            description: 'Failed to fetch students for the selected class',
            variant: 'destructive'
          })
          setStudents([])
        } finally {
          setLoadingStudents(false)
        }
      }
      fetchStudents()
    } else {
      setStudents([])
    }
  }, [selectedClassId])

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-white to-teal-50 p-8 rounded-lg shadow-xl space-y-8">
      <Card className="bg-white border-none shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 drop-shadow-sm">Student Directory</CardTitle>
          <p className="text-lg text-gray-600">View and manage student information for your classes.</p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-blue-800 flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Select Class</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="class-select" className="sr-only">Select Class</Label>
                  <Select
                    value={selectedClassId}
                    onValueChange={(value) => {
                      setSelectedClassId(value)
                      setSearchQuery('') // Clear search when class changes
                    }}
                    disabled={loadingSubjects}
                  >
                    <SelectTrigger id="class-select" className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                      <SelectValue placeholder={loadingSubjects ? "Loading classes..." : "Select a class"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.length === 0 && !loadingSubjects ? (
                        <SelectItem value="disabled" disabled>
                          No classes available
                        </SelectItem>
                      ) : (
                        subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.code} - {subject.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 shadow-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-green-800 flex items-center gap-2"><Users className="w-5 h-5" /> Students in {subjects.find(s => s.id === selectedClassId)?.name || 'Selected Class'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedClassId ? (
                    <div className="space-y-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder="Search students by name, ID, or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ease-in-out text-base"
                        />
                      </div>

                      {loadingStudents ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-solid"></div>
                        </div>
                      ) : filteredStudents.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                          <table className="w-full text-left table-auto">
                            <thead className="bg-green-100 text-green-800 uppercase text-sm leading-normal">
                              <tr>
                                <th className="py-3 px-6 text-left">Student ID</th>
                                <th className="py-3 px-6 text-left">Name</th>
                                <th className="py-3 px-6 text-left">Email</th>
                                <th className="py-3 px-6 text-left">Semester</th>
                                <th className="py-3 px-6 text-left">Enrollment Year</th>
                              </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm font-light">
                              {filteredStudents.map(student => (
                                <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                                  <td className="py-3 px-6 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-green-500" /> {student.studentId}
                                  </td>
                                  <td className="py-3 px-6">{student.name}</td>
                                  <td className="py-3 px-6 flex items-center gap-1">
                                    <Mail className="w-4 h-4 text-gray-400" /> {student.email}
                                  </td>
                                  <td className="py-3 px-6">{student.semester}</td>
                                  <td className="py-3 px-6">{student.enrollmentYear}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-600 text-lg bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8">
                          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="font-semibold">No students found for this class or matching your search.</p>
                          <p className="text-sm text-gray-500 mt-2">Try selecting a different class or adjusting your search query.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-600 text-lg bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8">
                      <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="font-semibold">Please select a class from the left to view students.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 