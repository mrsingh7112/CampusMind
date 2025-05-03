import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    let date: Date | null = null;
    if (dateParam) {
      date = new Date(dateParam);
      date.setHours(0, 0, 0, 0);
    }
    // Get all faculty members
    const faculty = await prisma.faculty.findMany({
      orderBy: { createdAt: 'desc' }
    });
    let result = [];
    for (const f of faculty) {
      let attendanceStatus = null;
      if (date) {
        const attendance = await prisma.facultyAttendance.findFirst({
          where: {
            facultyId: f.id,
            date: date
          },
          select: {
            status: true
          }
        });
        attendanceStatus = attendance?.status || null;
      }
      result.push({ 
        ...f, 
        attendanceStatus: attendanceStatus || 'NOT_MARKED'
      });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching faculty:', error)
    return NextResponse.json(
      { error: 'Failed to fetch faculty data' },
      { status: 500 }
    )
  }
} 