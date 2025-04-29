import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Find the public signup request
    const signup = await prisma.publicSignup.findUnique({ where: { id: params.id } });
    if (!signup) {
      return NextResponse.json({ error: 'Signup request not found' }, { status: 404 });
    }

    // 2. Create the appropriate record based on role
    if (signup.role === 'FACULTY') {
      await prisma.facultyMember.create({
        data: {
          name: signup.name,
          email: signup.email,
          department: signup.department,
          position: signup.position || '',
          tokenId: signup.tokenId,
          password: signup.password,
          status: 'ACTIVE'
        },
      });
    } else if (signup.role === 'STUDENT') {
      await prisma.studentMember.create({
        data: {
          name: signup.name,
          email: signup.email,
          department: signup.department,
          courseId: signup.courseId!,
          semester: signup.semester!,
          tokenId: signup.tokenId,
          password: signup.password,
          status: 'ACTIVE'
        },
      });
    }

    // 3. Delete the public signup record
    await prisma.publicSignup.delete({ where: { id: params.id } });
    
    // 4. Create an activity log
    await prisma.activityLog.create({
      data: {
        action: 'APPROVE',
        entity: signup.role === 'FACULTY' ? 'FACULTY' : 'STUDENT',
        details: `Approved ${signup.role.toLowerCase()} signup for ${signup.name} (${signup.email})`
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving public signup:', error);
    return NextResponse.json({ error: 'Error approving public signup' }, { status: 500 });
  }
} 