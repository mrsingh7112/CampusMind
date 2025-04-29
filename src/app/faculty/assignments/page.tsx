'use client'

import { useState } from 'react'
import { format, addDays } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Users, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function AssignmentsPage() {
  const [selectedClass, setSelectedClass] = useState('')
  const [showNewAssignment, setShowNewAssignment] = useState(false)
  const { toast } = useToast()

  const classes = [
    { id: 'CS101', name: 'Introduction to Computer Science', room: '301', time: '09:00 AM - 10:30 AM' },
    { id: 'CS201', name: 'Data Structures', room: '302', time: '11:00 AM - 12:30 PM' },
    { id: 'CS301', name: 'Database Management', room: '303', time: '02:00 PM - 03:30 PM' }
  ]

  const assignments = [
    {
      id: '1',
      title: 'Data Structures Assignment 1',
      classId: 'CS201',
      dueDate: addDays(new Date(), 7),
      totalSubmissions: 25,
      totalStudents: 35,
      status: 'active'
    },
    {
      id: '2',
      title: 'Database Design Project',
      classId: 'CS301',
      dueDate: addDays(new Date(), 14),
      totalSubmissions: 38,
      totalStudents: 40,
      status: 'active'
    }
  ]

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implementation for creating new assignment
    setShowNewAssignment(false)
        toast({
          title: 'Success',
      description: 'Assignment created successfully',
        })
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <div className="flex items-center space-x-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{cls.name}</span>
                    <span className="text-sm text-gray-500">Room {cls.room}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowNewAssignment(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </Button>
        </div>
      </div>

      {showNewAssignment ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAssignment} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input placeholder="Assignment title" required />
                  </div>
        <div>
                    <label className="block text-sm font-medium mb-2">Class</label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
            {classes.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
            ))}
                      </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Due Date</label>
                    <Calendar
                      mode="single"
                      selected={addDays(new Date(), 7)}
                      className="rounded-md border"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea 
                    placeholder="Assignment description and instructions..."
                    className="h-[300px]"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setShowNewAssignment(false)}>
                    Cancel
                  </Button>
                <Button type="submit">Create Assignment</Button>
                </div>
              </form>
          </CardContent>
        </Card>
          ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments
            .filter(a => !selectedClass || a.classId === selectedClass)
            .map(assignment => (
              <Card key={assignment.id} className="hover:border-blue-500 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start">
              <div>
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {classes.find(c => c.id === assignment.classId)?.name}
                      </p>
                    </div>
                    <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                      {assignment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Due {format(assignment.dueDate, 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      {assignment.totalSubmissions} / {assignment.totalStudents} submissions
                      </div>
                    <div className="pt-4">
                      <Button className="w-full" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                          View Submissions
                        </Button>
                      </div>
                    </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
} 