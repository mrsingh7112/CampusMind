import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate incoming data
    if (!data.date || !data.startTime || !data.endTime || !data.title || !data.priority) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newScheduleItem = await prisma.schedule.create({
      data: {
        facultyId: session.user.id,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        isCompleted: data.isCompleted || false,
        type: data.type || 'custom', // Default to 'custom' if not provided
      },
    });

    return NextResponse.json(newScheduleItem, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 