import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { courseIds } = await request.json();
    if (!Array.isArray(courseIds)) {
      return NextResponse.json({ error: 'courseIds must be an array' }, { status: 400 });
    }
    // Update faculty's courses
    const faculty = await prisma.faculty.update({
      where: { id: params.id },
      data: {
        courses: {
          set: courseIds.map((id: number) => ({ id })),
        },
      },
      include: { courses: true },
    });
    return NextResponse.json({ success: true, courses: faculty.courses });
  } catch (error) {
    console.error('Error assigning courses to faculty:', error);
    return NextResponse.json({ error: 'Failed to assign courses', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: params.id },
      include: { courses: true },
    });
    if (!faculty) return NextResponse.json({ error: 'Faculty not found' }, { status: 404 });
    return NextResponse.json({ courses: faculty.courses });
  } catch (error) {
    console.error('Error fetching faculty courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
} 