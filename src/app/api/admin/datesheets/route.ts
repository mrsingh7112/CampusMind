import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all datesheets
export async function GET() {
  try {
    const datesheets = await prisma.datesheet.findMany({
      include: {
        department: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
      },
      orderBy: { generatedAt: 'desc' },
    });
    return NextResponse.json(datesheets);
  } catch (error) {
    console.error('Error fetching datesheets:', error);
    return NextResponse.json({ error: 'Failed to fetch datesheets' }, { status: 500 });
  }
}

// POST create a new datesheet
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { departmentId, courseId, semester, examType, subjects, pdfFile } = body;
    const datesheet = await prisma.datesheet.create({
      data: {
        departmentId,
        courseId,
        semester,
        examType,
        subjects,
        pdfFile,
      },
      include: {
        department: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(datesheet);
  } catch (error) {
    console.error('Error creating datesheet:', error);
    return NextResponse.json({ error: 'Failed to create datesheet' }, { status: 500 });
  }
} 