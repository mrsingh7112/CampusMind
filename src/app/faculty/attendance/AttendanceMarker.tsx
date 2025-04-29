import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface AttendanceMarkerProps {
  facultyId: string
  facultyName: string
}

export function AttendanceMarker({ facultyId, facultyName }: AttendanceMarkerProps) {
  const [isVerifying, setIsVerifying] = useState(false)

  const handleMarkAttendance = async () => {
    setIsVerifying(true)
    try {
      // Get authentication options from server
      const optionsResponse = await fetch('/api/faculty/biometric/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ facultyId }),
      })

      if (!optionsResponse.ok) {
        throw new Error('Failed to start authentication')
      }

      const options = await optionsResponse.json()

      // Request fingerprint verification
      const assertion = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: new Uint8Array(options.challenge),
          allowCredentials: options.allowCredentials.map((credential: any) => ({
            ...credential,
            id: new Uint8Array(credential.id),
          })),
        },
      }) as PublicKeyCredential

      // Verify fingerprint and mark attendance
      const verifyResponse = await fetch('/api/faculty/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facultyId,
          credential: {
            id: assertion.id,
            type: assertion.type,
            rawId: Array.from(new Uint8Array(assertion.rawId)),
          },
        }),
      })

      if (!verifyResponse.ok) {
        throw new Error('Failed to mark attendance')
      }

      const result = await verifyResponse.json()
      toast.success(result.message || 'Attendance marked successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark attendance')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm">
            <p>Faculty Name: <span className="font-medium">{facultyName}</span></p>
            <p className="text-gray-500">Use your registered fingerprint to mark attendance</p>
          </div>
          <Button
            onClick={handleMarkAttendance}
            disabled={isVerifying}
            className="w-full"
          >
            {isVerifying ? 'Verifying...' : 'Mark Attendance'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 