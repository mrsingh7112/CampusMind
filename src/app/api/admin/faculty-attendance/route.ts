import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all faculty members
    const faculty = await prisma.facultyMember.findMany({
      where: {
        status: 'ACTIVE'
      }
    });

    // Get today's attendance
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const attendance = await prisma.facultyAttendance.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { time: 'desc' },
    });

    // Combine faculty data with attendance
    const records = faculty.map(f => ({
      ...f,
      attendance: attendance.filter(a => a.facultyId === f.id)
    }));

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching faculty attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { facultyId } = await request.json();

    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 });
    }

    // Check if faculty exists
    const faculty = await prisma.facultyMember.findUnique({
      where: { id: facultyId }
    });

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    }

    // Record attendance
    const now = new Date();
    const attendance = await prisma.facultyAttendance.create({
      data: {
        facultyId,
        date: now,
        time: now
      }
    });

    // Cleanup: delete attendance older than 6 months
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);
    await prisma.facultyAttendance.deleteMany({
      where: {
        date: { lt: cutoff },
      },
    });

    return NextResponse.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Error recording faculty attendance:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
} 