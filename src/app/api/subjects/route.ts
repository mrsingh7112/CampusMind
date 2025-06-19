import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseIdsParam = searchParams.get('courseIds');
  if (!courseIdsParam) {
    return NextResponse.json([], { status: 200 });
  }
  const courseIds = courseIdsParam.split(',').map(id => parseInt(id)).filter(Boolean);
  if (!courseIds.length) {
    return NextResponse.json([], { status: 200 });
  }
  const subjects = await prisma.subject.findMany({
    where: { courseId: { in: courseIds } },
    include: { course: true }
  });
  return NextResponse.json(subjects);
} 