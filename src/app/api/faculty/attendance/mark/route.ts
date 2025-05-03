import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, parseISO } from 'date-fns'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { facultyId, credential, date, status, manual } = body;

    if (manual) {
      // Manual attendance marking
      if (!facultyId || !date || !status) {
        return NextResponse.json(
          { error: 'Faculty ID, date, and status are required for manual marking' },
          { status: 400 }
        );
      }

      // Parse and normalize the date
      const attendanceDate = parseISO(date);
      attendanceDate.setHours(0, 0, 0, 0);

      // Check if already marked for this date
      const existing = await prisma.facultyAttendance.findFirst({
        where: {
          facultyId,
          date: attendanceDate
        }
      });

      if (existing) {
        return NextResponse.json({ 
          error: 'Attendance already marked for this date',
          existingStatus: existing.status
        }, { status: 400 });
      }

      // Create new attendance record
      await prisma.facultyAttendance.create({
        data: {
          facultyId,
          date: attendanceDate,
          status,
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: `Attendance marked as ${status}`,
        date: format(attendanceDate, 'yyyy-MM-dd')
      });
    }

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