import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { facultyId, fingerprintData } = await request.json()

    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 })
    }

    if (!fingerprintData?.id) {
      return NextResponse.json({ error: 'Fingerprint data is required' }, { status: 400 })
    }

    // Check if faculty exists
    const faculty = await prisma.facultyMember.findUnique({
      where: { id: facultyId }
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    // Check if fingerprint already exists
    const existingFingerprint = await prisma.facultyWebAuthnCredential.findFirst({
      where: { facultyId }
    })

    if (existingFingerprint) {
      return NextResponse.json(
        { error: 'Fingerprint already registered for this faculty' },
        { status: 400 }
      )
    }

    // Save the fingerprint and update the challenge
    const credential = await prisma.facultyWebAuthnCredential.create({
      data: {
        facultyId,
        fingerprintId: fingerprintData.id
      }
    })

    // Update the faculty's webauthnChallenge
    await prisma.facultyMember.update({
      where: { id: facultyId },
      data: {
        webauthnChallenge: fingerprintData.id
      }
    })

    return NextResponse.json({
      message: 'Fingerprint registered successfully',
      credential
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register fingerprint' },
      { status: 500 }
    )
  }
} 