import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== 'STUDENT') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const studentId = session.user.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: studentId,
        recipientType: 'STUDENT',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 