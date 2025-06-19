import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') { // isSuperAdmin check is not needed for just fetching subjects
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // You can optionally filter subjects by facultyId if you only want
    // subjects relevant to the faculty's assigned courses.
    // For now, let's fetch all subjects.
    const subjects = await prisma.subject.findMany({
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching available subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available subjects' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN' || !session.user.isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const facultyId = params.id;
    const { subjectIds } = await request.json();

    if (!Array.isArray(subjectIds)) {
      return NextResponse.json({ error: 'Invalid subjectIds format' }, { status: 400 });
    }

    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing facultySubject entries for this faculty
      await tx.facultySubject.deleteMany({
        where: { facultyId: facultyId },
      });

      // Create new facultySubject entries
      if (subjectIds.length > 0) {
        const createData = subjectIds.map((subjectId: number) => ({
          facultyId: facultyId,
          subjectId: subjectId,
        }));
        await tx.facultySubject.createMany({
          data: createData,
          skipDuplicates: true, // In case a subjectId is somehow duplicated in the input array
        });
      }
    });

    return NextResponse.json({ message: 'Subjects updated successfully' });
  } catch (error) {
    console.error('Error updating faculty subjects:', error);
    return NextResponse.json(
      { error: 'Failed to update faculty subjects' },
      { status: 500 }
    );
  }
} 