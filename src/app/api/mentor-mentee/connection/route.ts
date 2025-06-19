import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Get mentor-mentee connections
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'MENTOR' or 'MENTEE'
    const userId = session.user.id;

    if (role === 'MENTOR') {
      // Get all mentees for this faculty mentor
      const connections = await prisma.mentorMenteeConnection.findMany({
        where: { mentorId: userId },
        include: {
          mentee: {
            select: {
              id: true,
              name: true,
              email: true,
              rollNumber: true,
              course: {
                select: {
                  name: true,
                  code: true,
                },
              },
              currentSemester: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(connections);
    } else if (role === 'MENTEE') {
      // Get mentor for this student
      const connection = await prisma.mentorMenteeConnection.findFirst({
        where: { menteeId: userId },
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              department: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(connection);
    } else {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching mentor-mentee connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentor-mentee connections' },
      { status: 500 }
    );
  }
}

// POST: Create a new mentor-mentee connection
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { menteeId } = await request.json();
    if (!menteeId) {
      return NextResponse.json(
        { error: 'Mentee ID is required' },
        { status: 400 }
      );
    }

    // Check if mentee exists and is active
    const mentee = await prisma.student.findUnique({
      where: { id: menteeId },
      select: { id: true, status: true },
    });

    if (!mentee) {
      return NextResponse.json({ error: 'Mentee not found' }, { status: 404 });
    }

    if (mentee.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot connect with inactive student' },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const existingConnection = await prisma.mentorMenteeConnection.findFirst({
      where: { menteeId },
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Student already has a mentor' },
        { status: 400 }
      );
    }

    // Create new connection
    const connection = await prisma.mentorMenteeConnection.create({
      data: {
        mentorId: session.user.id,
        menteeId,
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
          },
        },
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        entity: 'MENTOR_MENTEE_CONNECTION',
        details: `Created mentor-mentee connection between ${connection.mentor.name} and ${connection.mentee.name}`,
        userId: session.user.id,
        userType: 'FACULTY',
      },
    });

    return NextResponse.json(connection);
  } catch (error) {
    console.error('Error creating mentor-mentee connection:', error);
    return NextResponse.json(
      { error: 'Failed to create mentor-mentee connection' },
      { status: 500 }
    );
  }
} 