import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateRegistrationOptions } from '@simplewebauthn/server'

export async function POST(request: Request) {
  try {
    const { facultyId } = await request.json()

    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 })
    }

    // Get faculty details
    const faculty = await prisma.facultyMember.findUnique({
      where: { id: facultyId },
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: 'Campus Mind',
      rpID: process.env.WEBAUTHN_RP_ID || 'localhost',
      userID: facultyId,
      userName: faculty.email,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: false,
        userVerification: 'preferred',
      },
    })

    // Store challenge in database for verification
    await prisma.facultyWebAuthnCredential.create({
      data: {
        facultyId,
        credentialId: '', // Will be updated after verification
        publicKey: '', // Will be updated after verification
      },
    })

    return NextResponse.json(options)
  } catch (error: any) {
    console.error('Error in biometric registration:', error)
    return NextResponse.json(
      { error: 'Failed to start registration' },
      { status: 500 }
    )
  }
} 