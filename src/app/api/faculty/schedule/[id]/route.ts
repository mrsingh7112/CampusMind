import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Validate incoming data
    if (!data.date || !data.startTime || !data.endTime || !data.title || !data.priority) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedScheduleItem = await prisma.schedule.update({
      where: {
        id: id,
        facultyId: session.user.id, // Ensure only faculty can update their own schedule items
      },
      data: {
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        isCompleted: data.isCompleted || false,
      },
    });

    return NextResponse.json(updatedScheduleItem, { status: 200 });
  } catch (error) {
    console.error('Error updating schedule item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.schedule.delete({
      where: {
        id: id,
        facultyId: session.user.id, // Ensure only faculty can delete their own schedule items
      },
    });

    return NextResponse.json({ message: 'Schedule item deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 