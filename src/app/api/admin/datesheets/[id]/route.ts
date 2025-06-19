import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const datesheet = await prisma.datesheet.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
      },
    });
    if (!datesheet) {
      return NextResponse.json({ error: 'Datesheet not found' }, { status: 404 });
    }
    return NextResponse.json(datesheet);
  } catch (error) {
    console.error('Error fetching datesheet:', error);
    return NextResponse.json({ error: 'Failed to fetch datesheet' }, { status: 500 });
  }
} 