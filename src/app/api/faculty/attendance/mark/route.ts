import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { facultyId, credential } = await request.json()

    if (!facultyId || !credential) {
      return NextResponse.json(
        { error: 'Faculty ID and credential are required' },
        { status: 400 }
      )
    }

    // Get the stored credential
    const storedCredential = await prisma.facultyWebAuthnCredential.findFirst({
      where: { facultyId }
    })

    if (!storedCredential) {
      return NextResponse.json(
        { error: 'No registered fingerprint found' },
        { status: 404 }
      )
    }

    // Compare the credential IDs (both should be in base64url format)
    if (storedCredential.credentialId !== credential.id) {
      console.log('Credential mismatch:', {
        stored: storedCredential.credentialId,
        received: credential.id
      })
      return NextResponse.json(
        { error: 'Fingerprint does not match' },
        { status: 400 }
      )
    }

    // Check if attendance already marked today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existingAttendance = await prisma.facultyAttendance.findFirst({
      where: {
        facultyId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (existingAttendance) {
      return NextResponse.json({
        error: 'Attendance already marked for today'
      }, { status: 400 })
    }

    // Mark attendance
    const now = new Date()
    await prisma.facultyAttendance.create({
      data: {
        facultyId,
        date: now,
        time: now,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully'
    })
  } catch (error: any) {
    console.error('Error marking attendance:', error)
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    )
  }
} 