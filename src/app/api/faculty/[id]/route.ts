import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const facultyId = params.id

    // Get faculty details
    const faculty = await prisma.facultyMember.findUnique({
      where: { id: facultyId },
    })

    if (!faculty) {
      return NextResponse.json(
        { error: 'Faculty not found' },
        { status: 404 }
      )
    }

    // Check if faculty has registered biometric
    const biometric = await prisma.facultyWebAuthnCredential.findFirst({
      where: { facultyId },
    })

    // Get last attendance
    const lastAttendance = await prisma.facultyAttendance.findFirst({
      where: { facultyId },
      orderBy: { time: 'desc' },
    })

    return NextResponse.json({
      id: faculty.id,
      name: faculty.name,
      email: faculty.email,
      department: faculty.department,
      status: faculty.status,
      hasBiometric: !!biometric,
      lastMarked: lastAttendance?.time || null,
    })
  } catch (error) {
    console.error('Error fetching faculty data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty data' },
      { status: 500 }
    )
  }
} 