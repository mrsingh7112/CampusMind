import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { arrayBufferToBase64url, base64urlToUint8Array } from '@/lib/webauthn'

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
      const credential = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: base64urlToUint8Array(options.challenge),
          allowCredentials: options.allowCredentials.map((cred: any) => ({
            ...cred,
            id: base64urlToUint8Array(cred.id),
          })),
        },
      }) as PublicKeyCredential

      // Send credential for attendance marking
      const markResponse = await fetch('/api/faculty/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facultyId,
          credential: {
            id: credential.id,
            type: credential.type,
            rawId: arrayBufferToBase64url(credential.rawId),
          },
        }),
      })

      if (!markResponse.ok) {
        const error = await markResponse.json()
        throw new Error(error.error || 'Failed to mark attendance')
      }

      const result = await markResponse.json()
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