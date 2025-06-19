'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CalendarIcon, UserRoundCheck, UserRoundX, PlaneTakeoff, BellRing, CircleCheck } from 'lucide-react'
import { format } from 'date-fns'

export default function FacultyAttendanceMarking({ facultyId, subjects }: { facultyId: string, subjects: any[] }) {
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [date, setDate] = useState(() => new Date())
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [leaveReasons, setLeaveReasons] = useState<Record<string, string>>({})
  const [showCustomReason, setShowCustomReason] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const predefinedReasons = [
    'Medical Leave',
    'Family Emergency',
    'Official Work',
    'Personal Reasons',
    'Other'
  ]

  useEffect(() => {
    if (selectedSubject) {
      setLoading(true)
      fetch(`/api/subject/${selectedSubject.id}/students`)
        .then(res => res.json())
        .then(data => setStudents(data))
        .catch(() => setStudents([]))
        .finally(() => setLoading(false))
    } else {
      setStudents([])
    }
  }, [selectedSubject])

  const handleMark = (studentId: string, status: string) => {
    setAttendance({ ...attendance, [studentId]: status })
    if (status !== 'LEAVE') {
      setLeaveReasons({ ...leaveReasons, [studentId]: '' })
      setShowCustomReason({ ...showCustomReason, [studentId]: false })
    }
  }

  const handleReasonChange = (studentId: string, reason: string) => {
    setLeaveReasons({ ...leaveReasons, [studentId]: reason })
    setShowCustomReason({ ...showCustomReason, [studentId]: reason === 'Other' })
  }

  const handleSubmit = async () => {
    if (!selectedSubject || !date) {
      setMessage('Please select subject and date')
      return
    }

    if (date.getDay() === 0) { // 0 represents Sunday
      setMessage('Attendance cannot be marked on Sundays.')
      setShowSuccess(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/faculty/attendance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject.id,
          date: format(date, 'yyyy-MM-dd'),
          attendance: Object.entries(attendance).reduce((acc, [studentId, status]) => {
            acc[studentId] = {
              status: status,
              notes: status === 'LEAVE' ? leaveReasons[studentId] : undefined
            }
            return acc
          }, {} as Record<string, { status: string; notes?: string }>)
        })
      })

      if (response.ok) {
        setShowSuccess(true)
        setMessage('')
        setAttendance({})
        setLeaveReasons({})
        setShowCustomReason({})
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        const data = await response.json()
        setMessage(data.error || 'Failed to mark attendance')
      }
    } catch (error) {
      setMessage('Error submitting attendance')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-white to-orange-50 p-8 rounded-lg shadow-xl space-y-8">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <CircleCheck className="w-6 h-6 text-green-600" />
            <p className="font-semibold">Attendance marked successfully!</p>
          </div>
        </div>
      )}

      {message && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <BellRing className="w-6 h-6 text-red-600" />
            <p className="font-semibold">{message}</p>
          </div>
        </div>
      )}

      <Card className="bg-white border-none shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900 drop-shadow-sm">Mark Daily Attendance</CardTitle>
          <p className="text-lg text-gray-600">Select a subject and date to record student attendance.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Selection */}
          <div>
            <Label htmlFor="subject-select" className="block text-base font-medium text-gray-700 mb-2">Select Subject</Label>
            <Select
              value={selectedSubject?.id ? String(selectedSubject.id) : ''}
              onValueChange={(value) => {
                const subject = subjects.find(s => String(s.id) === value)
                setSelectedSubject(subject || null)
              }}
            >
              <SelectTrigger id="subject-select" className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={String(subject.id)}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div>
            <Label htmlFor="date-input" className="block text-base font-medium text-gray-700 mb-2">Select Date</Label>
            <div className="relative">
              <Input
                id="date-input"
                type="date"
                value={format(date, 'yyyy-MM-dd')}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 pr-10"
              />
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Student List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 border-solid"></div>
            </div>
          ) : students.length > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-2xl font-semibold text-gray-900">Student List</h2>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => {
                      const newAttendance = { ...attendance }
                      students.forEach(student => {
                        newAttendance[student.id] = 'PRESENT'
                      })
                      setAttendance(newAttendance)
                    }}
                    className="flex items-center gap-2 px-5 py-2 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <UserRoundCheck className="w-5 h-5" /> Mark All Present
                  </Button>
                  <Button
                    onClick={() => {
                      const newAttendance = { ...attendance }
                      students.forEach(student => {
                        newAttendance[student.id] = 'ABSENT'
                      })
                      setAttendance(newAttendance)
                    }}
                    className="flex items-center gap-2 px-5 py-2 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <UserRoundX className="w-5 h-5" /> Mark All Absent
                  </Button>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {students.map((student) => (
                  <div key={student.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-200">{student.name}</h3>
                        <p className="text-sm text-gray-500">Roll No: {student.rollNumber}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroup
                          onValueChange={(value: string) => handleMark(student.id, value)}
                          value={attendance[student.id] || ''}
                          className="flex gap-2"
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="PRESENT" id={`present-${student.id}`} className="peer sr-only" />
                            <Label
                              htmlFor={`present-${student.id}`}
                              className={`flex items-center justify-center p-2 rounded-full cursor-pointer transition-all duration-200 ease-in-out
                                ${attendance[student.id] === 'PRESENT'
                                  ? 'bg-green-100 text-green-800 border-2 border-green-500 shadow-sm'
                                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'
                                }`}
                            >
                              <UserRoundCheck className="w-5 h-5" />
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <RadioGroupItem value="ABSENT" id={`absent-${student.id}`} className="peer sr-only" />
                            <Label
                              htmlFor={`absent-${student.id}`}
                              className={`flex items-center justify-center p-2 rounded-full cursor-pointer transition-all duration-200 ease-in-out
                                ${attendance[student.id] === 'ABSENT'
                                  ? 'bg-red-100 text-red-800 border-2 border-red-500 shadow-sm'
                                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
                                }`}
                            >
                              <UserRoundX className="w-5 h-5" />
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <RadioGroupItem value="LEAVE" id={`leave-${student.id}`} className="peer sr-only" />
                            <Label
                              htmlFor={`leave-${student.id}`}
                              className={`flex items-center justify-center p-2 rounded-full cursor-pointer transition-all duration-200 ease-in-out
                                ${attendance[student.id] === 'LEAVE'
                                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-500 shadow-sm'
                                  : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700'
                                }`}
                            >
                              <PlaneTakeoff className="w-5 h-5" />
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    {attendance[student.id] === 'LEAVE' && (
                      <div className="mt-4">
                        <Label htmlFor={`reason-${student.id}`} className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave</Label>
                        <Select
                          value={leaveReasons[student.id] || ''}
                          onValueChange={(value) => handleReasonChange(student.id, value)}
                        >
                          <SelectTrigger id={`reason-${student.id}`} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            {predefinedReasons.map((reason) => (
                              <SelectItem key={reason} value={reason}>
                                {reason}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {showCustomReason[student.id] && (
                          <Input
                            type="text"
                            value={leaveReasons[student.id]}
                            onChange={(e) => handleReasonChange(student.id, e.target.value)}
                            placeholder="Enter custom reason"
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (selectedSubject && !loading) ? (
            <div className="text-center py-12 text-gray-500 text-lg">
              No students found for this subject. Please ensure students are assigned.
            </div>
          ) : ( !selectedSubject && !loading ) ? (
            <div className="text-center py-12 text-gray-500 text-lg">
              Please select a subject to view students and mark attendance.
            </div>
          ) : null}

          {selectedSubject && students.length > 0 && (
            <div className="pt-6 border-t border-gray-200 mt-6">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
              >
                {loading ? 'Submitting...' : 'Submit Attendance'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 