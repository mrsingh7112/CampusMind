import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

function generateToken(role: string) {
  const prefix = role === 'FACULTY' ? 'FAC' : 'STU';
  const random = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${prefix}${random}`;
}

export async function POST(req: NextRequest) {
  const { name, email, password, role, department, position, courseId, semester } = await req.json();
  if (!name || !email || !password || !role || !department) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }
  if (role === 'FACULTY' && !position) {
    return NextResponse.json({ error: 'Position is required for faculty.' }, { status: 400 });
  }
  if (role === 'STUDENT' && (!courseId || !semester)) {
    return NextResponse.json({ error: 'Course and semester are required for students.' }, { status: 400 });
  }
  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });
  }
  // Generate unique token
  let tokenId = '';
  let tries = 0;
  while (!tokenId && tries < 10) {
    const candidate = generateToken(role);
    const existsInUser = await prisma.user.findFirst({ where: { tokenId: candidate } });
    const existsInSignup = await prisma.publicSignup.findFirst({ where: { tokenId: candidate } });
    if (!existsInUser && !existsInSignup) tokenId = candidate;
    tries++;
  }
  if (!tokenId) {
    return NextResponse.json({ error: 'Could not generate unique token.' }, { status: 500 });
  }
  // Hash password
  const hashed = await hash(password, 10);
  // Store in PublicSignup
  try {
    await prisma.publicSignup.create({
      data: {
        name,
        email,
        password: hashed,
        role,
        department,
        position: role === 'FACULTY' ? position : undefined,
        courseId: role === 'STUDENT' ? parseInt(courseId, 10) : undefined,
        semester: role === 'STUDENT' ? parseInt(semester, 10) : undefined,
        tokenId,
      },
    });
    return NextResponse.json({ tokenId });
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json({ error: 'Sign up failed.' }, { status: 500 });
  }
} 