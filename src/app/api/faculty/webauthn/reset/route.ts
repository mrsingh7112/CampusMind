import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { facultyId } = await request.json();
    
    // Delete all credentials for this faculty
    await prisma.facultyWebAuthnCredential.deleteMany({
      where: { facultyId }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Reset error:', err);
    return NextResponse.json({ error: err.message || 'Failed to reset fingerprint' }, { status: 400 });
  }
} 