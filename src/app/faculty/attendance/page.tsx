import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FacultyAttendanceMarking from './FacultyAttendanceMarking'

export const dynamic = 'force-dynamic'

export default async function AttendancePage() {
  // Get faculty ID from session
  const session = await getServerSession(authOptions)
  const facultyId = session?.user?.id
  if (!facultyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Faculty not logged in</p>
        </CardContent>
      </Card>
    )
  }

  // Use absolute URL for server-side fetch
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const subjectsRes = await fetch(`${baseUrl}/api/faculty/${facultyId}/subjects`, { cache: 'no-store' })
  const subjects = await subjectsRes.json()

  return (
    <FacultyAttendanceMarking facultyId={facultyId} subjects={subjects} />
  )
} 