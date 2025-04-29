import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRegistrationResponse } from '@simplewebauthn/server'

export async function POST(request: Request) {
  try {
    const { facultyId, credential } = await request.json()

    if (!facultyId || !credential) {
      return NextResponse.json(
        { error: 'Faculty ID and credential are required' },
        { status: 400 }
      )
    }

    // Get the existing credential
    const existingCredential = await prisma.facultyWebAuthnCredential.findFirst({
      where: { facultyId },
    })

    if (!existingCredential) {
      return NextResponse.json(
        { error: 'No registration in progress' },
        { status: 404 }
      )
    }

    // Get the faculty and their stored challenge
    const faculty = await prisma.facultyMember.findUnique({ where: { id: facultyId } });
    const expectedChallenge = faculty?.webauthnChallenge || '';

    try {
      // Verify the credential
      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge,
        expectedOrigin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        expectedRPID: process.env.WEBAUTHN_RP_ID || 'localhost',
      })

      if (verification.verified) {
        // Update the credential with the verified data
        await prisma.facultyWebAuthnCredential.update({
          where: { id: existingCredential.id },
          data: {
            credentialId: credential.id,
            publicKey: verification.registrationInfo?.credentialPublicKey.toString('base64') || '',
          },
        })

        return NextResponse.json({
          success: true,
          message: 'Fingerprint verified successfully',
        })
      } else {
        throw new Error('Verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      return NextResponse.json(
        { error: 'Failed to verify fingerprint' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Error in biometric verification:', error)
    return NextResponse.json(
      { error: 'Failed to verify fingerprint' },
      { status: 500 }
    )
  }
} 