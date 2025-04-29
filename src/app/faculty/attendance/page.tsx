import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { AttendanceCalendar } from './AttendanceCalendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format, subMonths } from 'date-fns'

export const dynamic = 'force-dynamic'

async function getAttendanceData(facultyId: string) {
  const startDate = subMonths(new Date(), 2) // Get last 2 months of data
  const attendance = await prisma.facultyAttendance.findMany({
    where: {
      facultyId,
      date: {
        gte: startDate
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  return attendance
}

export default async function AttendancePage() {
  // TODO: Get actual faculty ID from session
  const facultyId = 'your-faculty-id'
  
  const faculty = await prisma.facultyMember.findUnique({
    where: { id: facultyId }
  })

  if (!faculty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Faculty member not found</p>
        </CardContent>
      </Card>
    )
  }

  const attendanceData = await getAttendanceData(facultyId)

  const stats = attendanceData.reduce(
    (acc, curr) => {
      acc[curr.status.toLowerCase()]++
      return acc
    },
    { present: 0, absent: 0, leave: 0 }
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-green-600"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-red-600"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Days</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-yellow-600"
            >
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.leave}</div>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<div>Loading calendar...</div>}>
        <AttendanceCalendar
          facultyId={faculty.id}
          facultyName={faculty.name}
          attendanceData={attendanceData}
        />
      </Suspense>
    </div>
  )
} 