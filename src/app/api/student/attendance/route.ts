import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const studentId = session.user.id;
  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get('month'); // YYYY-MM format
  const yearParam = searchParams.get('year'); // YYYY format

  let startDate: Date;
  let endDate: Date;

  if (monthParam && yearParam) {
    const date = new Date(parseInt(yearParam), parseInt(monthParam) - 1, 1);
    startDate = startOfMonth(date);
    endDate = endOfMonth(date);
  } else {
    // Default to current month if no month/year specified
    startDate = startOfMonth(new Date());
    endDate = endOfMonth(new Date());
  }

  try {
    const totalAttendanceRecords = await prisma.studentAttendance.count({
      where: {
        studentId: studentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const presentAttendanceRecords = await prisma.studentAttendance.count({
      where: {
        studentId: studentId,
        status: 'PRESENT',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const attendanceRecords = await prisma.studentAttendance.findMany({
      where: {
        studentId: studentId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        subject: { select: { name: true, code: true } },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const percentage = totalAttendanceRecords > 0
      ? (presentAttendanceRecords / totalAttendanceRecords) * 100
      : 0;

    return NextResponse.json({
      stats: {
        totalClasses: totalAttendanceRecords,
        attendedClasses: presentAttendanceRecords,
        percentage: parseFloat(percentage.toFixed(2)),
        month: format(startDate, 'yyyy-MM'),
      },
      records: attendanceRecords,
    });
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 