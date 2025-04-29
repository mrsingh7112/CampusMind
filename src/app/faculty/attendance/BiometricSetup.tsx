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
      // First, check if we can use biometric authentication
      if (!window.PublicKeyCredential) {
        throw new Error('Biometric authentication is not supported by this browser')
      }

      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (!available) {
        throw new Error('No biometric sensor found on this device')
      }

      // Generate a random challenge
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const challengeBase64 = btoa(String.fromCharCode(...challenge))

      // Create the credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'Campus Mind',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(facultyId),
            name: facultyId,
            displayName: 'Faculty Member'
          },
          pubKeyCredParams: [{
            type: 'public-key',
            alg: -7 // ES256
          }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          },
          timeout: 60000
        }
      })

      if (!credential) {
        throw new Error('Failed to register fingerprint')
      }

      // Save the registration
      const response = await fetch('/api/faculty/biometric/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facultyId,
          fingerprintData: {
            id: challengeBase64
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save fingerprint')
      }

      toast.success('Fingerprint registered successfully')
    } catch (error: any) {
      console.error('Registration error:', error)
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
          Your device will prompt you to use your fingerprint sensor.
        </p>
        <Button
          onClick={handleRegisterFingerprint}
          disabled={isRegistering}
          className="w-full"
        >
          {isRegistering ? 'Registering...' : 'Register Fingerprint'}
        </Button>
      </CardContent>
    </Card>
  )
} 
} 