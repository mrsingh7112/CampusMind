import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface AttendanceCalendarProps {
  facultyId: string
  facultyName: string
  attendanceData?: {
    date: Date
    status: string
    notes?: string
  }[]
}

export function AttendanceCalendar({
  facultyId,
  facultyName,
  attendanceData = []
}: AttendanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [status, setStatus] = useState('PRESENT')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Convert attendance data for calendar highlighting
  const attendanceDates = attendanceData.reduce((acc, curr) => {
    acc[format(new Date(curr.date), 'yyyy-MM-dd')] = curr.status
    return acc
  }, {} as Record<string, string>)

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/faculty/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facultyId,
          date: selectedDate,
          status,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark attendance')
      }

      toast.success('Attendance marked successfully')
      setNotes('')
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error('Failed to mark attendance')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar - {facultyName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="flex flex-col space-y-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  present: (date) => 
                    attendanceDates[format(date, 'yyyy-MM-dd')] === 'PRESENT',
                  absent: (date) =>
                    attendanceDates[format(date, 'yyyy-MM-dd')] === 'ABSENT',
                  leave: (date) =>
                    attendanceDates[format(date, 'yyyy-MM-dd')] === 'LEAVE',
                }}
                modifiersStyles={{
                  present: { backgroundColor: '#dcfce7', color: '#166534' },
                  absent: { backgroundColor: '#fee2e2', color: '#991b1b' },
                  leave: { backgroundColor: '#fef9c3', color: '#854d0e' },
                }}
              />
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded bg-[#dcfce7]" />
                  <span className="ml-1">Present</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded bg-[#fee2e2]" />
                  <span className="ml-1">Absent</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded bg-[#fef9c3]" />
                  <span className="ml-1">Leave</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">Selected Date</h3>
                <p className="text-lg font-semibold">
                  {selectedDate ? format(selectedDate, 'PPPP') : 'No date selected'}
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Status</h3>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="LEAVE">Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="mb-2 font-medium">Notes (Optional)</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="h-24"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!selectedDate || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Marking Attendance...' : 'Mark Attendance'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 