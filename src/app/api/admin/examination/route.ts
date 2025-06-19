import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch departments with their courses and subjects
    const departments = await prisma.department.findMany({
      include: {
        courses: {
          include: {
            subjects: {
              orderBy: {
                semester: 'asc'
              }
            }
          }
        }
      }
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching examination data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch examination data' },
      { status: 500 }
    );
  }
} 