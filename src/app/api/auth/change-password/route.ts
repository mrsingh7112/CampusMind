import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id || !session.user.role) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: 'All password fields are required' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: 'New password and confirm password do not match' }, { status: 400 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    let user;
    switch (userRole) {
      case 'ADMIN':
        user = await prisma.admin.findUnique({ where: { id: userId } });
        break;
      case 'FACULTY':
        user = await prisma.faculty.findUnique({ where: { id: userId } });
        break;
      case 'STUDENT':
        user = await prisma.student.findUnique({ where: { id: userId } });
        break;
      default:
        return NextResponse.json({ message: 'Invalid user role' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash new password

    switch (userRole) {
      case 'ADMIN':
        await prisma.admin.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });
        break;
      case 'FACULTY':
        await prisma.faculty.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });
        break;
      case 'STUDENT':
        await prisma.student.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });
        break;
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 