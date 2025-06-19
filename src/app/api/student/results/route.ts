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
  const { searchParams } = new URL(req.url);
  const semesterParam = searchParams.get('semester');

  try {
    const results = await prisma.result.findMany({
      where: {
        studentId: studentId,
        ...(semesterParam && { subject: { semester: parseInt(semesterParam) } })
      },
      include: {
        subject: { select: { name: true, code: true, semester: true } },
      },
      orderBy: [
        { subject: { semester: 'asc' } },
        { createdAt: 'desc' },
      ],
    });

    // Calculate GPA/CGPA if applicable (simple example)
    let totalCredits = 0;
    let totalGradePoints = 0;

    results.forEach(result => {
      // Assuming a simple 4.0 GPA scale or similar for example
      // You might need to adjust this based on your actual grading system and credit values
      const gradeValue = parseFloat(result.grade);
      if (!isNaN(gradeValue) && result.subject?.credits) {
        totalCredits += result.subject.credits;
        totalGradePoints += (gradeValue / 10) * result.subject.credits; // Example: converting 1-10 scale to 0-4 for grade points
      }
    });

    const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 'N/A';

    return NextResponse.json({
      results,
      gpa,
    });
  } catch (error) {
    console.error('Error fetching student results:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 