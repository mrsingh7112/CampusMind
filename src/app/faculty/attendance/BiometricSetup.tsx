import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface BiometricSetupProps {
  facultyId: string
}

export function BiometricSetup({ facultyId }: BiometricSetupProps) {
  const [isRegistering, setIsRegistering] = useState(false)

  const handleRegisterFingerprint = async () => {
    setIsRegistering(true)
    try {
      // Check if biometric authentication is available
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported by this browser')
      }

      // Request fingerprint registration from the server
      const response = await fetch('/api/faculty/biometric/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ facultyId }),
      })

      if (!response.ok) {
        throw new Error('Failed to start fingerprint registration')
      }

      const options = await response.json()

      // Create credentials using the browser's WebAuthn API
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: new Uint8Array(options.challenge),
          user: {
            ...options.user,
            id: new Uint8Array(options.user.id),
          },
        },
      }) as PublicKeyCredential

      // Send the credential to the server
      const verificationResponse = await fetch('/api/faculty/biometric/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facultyId,
          credential: {
            id: credential.id,
            type: credential.type,
            rawId: Array.from(new Uint8Array((credential.rawId))),
          },
        }),
      })

      if (!verificationResponse.ok) {
        throw new Error('Failed to verify fingerprint')
      }

      toast.success('Fingerprint registered successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to register fingerprint')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Biometric Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Register your fingerprint to mark attendance using biometric authentication.
        </p>
        <Button
          onClick={handleRegisterFingerprint}
          disabled={isRegistering}
        >
          {isRegistering ? 'Registering...' : 'Register Fingerprint'}
        </Button>
      </CardContent>
    </Card>
  )
} 