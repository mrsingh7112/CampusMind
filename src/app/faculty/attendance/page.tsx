import { BiometricSetup } from './BiometricSetup'
import { AttendanceMarker } from './AttendanceMarker'
import { Card } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function AttendancePage() {
  // Get the current faculty member (you'll need to implement your own auth logic)
  const faculty = await prisma.facultyMember.findFirst({
    where: {
      // Add your auth condition here
    },
  })

  if (!faculty) {
    redirect('/login')
  }

  // Check if faculty has registered their fingerprint
  const hasBiometric = await prisma.facultyWebAuthnCredential.findFirst({
    where: {
      facultyId: faculty.id,
    },
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Faculty Attendance</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {!hasBiometric && (
          <BiometricSetup facultyId={faculty.id} />
        )}
        
        {hasBiometric && (
          <AttendanceMarker
            facultyId={faculty.id}
            facultyName={faculty.name}
          />
        )}

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Attendance Status</h2>
          <div className="space-y-2">
            <p>
              Status:{' '}
              <span className={faculty.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}>
                {faculty.status}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              Your status will automatically change to INACTIVE after your 8-hour shift.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
} 