import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/count')) {
    // Return count of unique timetables
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const uniqueTimetables = await prisma.timetableSlot.findMany({
        distinct: ['courseId', 'semester'],
        select: { courseId: true, semester: true }
      });
      return NextResponse.json({ count: uniqueTimetables.length });
    } catch (error) {
      console.error('Error counting timetables:', error);
      return NextResponse.json({ error: 'Failed to count timetables' }, { status: 500 });
    }
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all timetable slots, grouped by course and semester
    const slots = await prisma.timetableSlot.findMany({
      include: {
        course: { select: { id: true, name: true, code: true } },
        subject: { select: { id: true, name: true, code: true, type: true } },
        faculty: { select: { id: true, name: true, email: true } },
        room: { select: { id: true, name: true, type: true, building: true, floor: true } },
      },
      orderBy: [
        { courseId: 'asc' },
        { semester: 'asc' },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    // Group by course and semester
    const timetableMap: Record<string, any> = {};
    for (const slot of slots) {
      const key = `${slot.courseId}-${slot.semester}`;
      if (!timetableMap[key]) {
        timetableMap[key] = {
          course: slot.course,
          semester: slot.semester,
          slots: [],
          createdAt: slot.createdAt,
        };
      }
      timetableMap[key].slots.push(slot);
      if (slot.createdAt < timetableMap[key].createdAt) {
        timetableMap[key].createdAt = slot.createdAt;
      }
    }

    // Convert to array
    const timetables = Object.values(timetableMap);

    return NextResponse.json(timetables);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    return NextResponse.json({ error: 'Failed to fetch timetables' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const deleteAll = searchParams.get('deleteAll') === 'true';
    
    if (deleteAll) {
      // Delete all timetable slots
      await prisma.timetableSlot.deleteMany({});
      return NextResponse.json({ message: 'All timetables deleted successfully' });
    }

    const courseId = parseInt(searchParams.get('courseId'));
    const semester = parseInt(searchParams.get('semester'));
    if (!courseId || !semester) {
      return NextResponse.json({ error: 'courseId and semester are required' }, { status: 400 });
    }
    await prisma.timetableSlot.deleteMany({ where: { courseId, semester } });
    return NextResponse.json({ message: 'Timetable deleted' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    return NextResponse.json({ error: 'Failed to delete timetable' }, { status: 500 });
  }
} 