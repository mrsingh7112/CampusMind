import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id || !session.user.role) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    let updatedUser;
    switch (userRole) {
      case 'ADMIN':
        updatedUser = await prisma.admin.update({
          where: { id: userId },
          data: { name, email },
        });
        break;
      case 'FACULTY':
        updatedUser = await prisma.faculty.update({
          where: { id: userId },
          data: { name, email },
        });
        break;
      case 'STUDENT':
        updatedUser = await prisma.student.update({
          where: { id: userId },
          data: { name, email },
        });
        break;
      default:
        return NextResponse.json({ message: 'Invalid user role' }, { status: 400 });
    }

    // Update the session to reflect new name and email immediately
    // await update({
    //   user: {
    //     name: updatedUser.name,
    //     email: updatedUser.email,
    //   },
    // });

    return NextResponse.json({ success: true, message: 'Profile updated successfully', user: updatedUser });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 