import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const signups = await prisma.publicSignup.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(signups);
  } catch (error) {
    console.error('Error fetching public signups:', error);
    return NextResponse.json({ error: 'Failed to fetch public signups' }, { status: 500 });
  }
} 