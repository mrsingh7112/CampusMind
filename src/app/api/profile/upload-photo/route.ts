import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id || !session.user.role) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the upload directory and filename
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    // Ensure the upload directory exists
    // You might need to create this directory manually or add a check/creation logic
    // if it doesn't exist already, before writing the file.
    // For simplicity, assuming it exists for now.
    const filename = `${session.user.id}-${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    const userId = session.user.id;
    const userRole = session.user.role;

    switch (userRole) {
      case 'ADMIN':
        await prisma.admin.update({
          where: { id: userId },
          data: { profilePicture: fileUrl },
        });
        break;
      case 'FACULTY':
        await prisma.faculty.update({
          where: { id: userId },
          data: { profilePicture: fileUrl },
        });
        break;
      case 'STUDENT':
        await prisma.student.update({
          where: { id: userId },
          data: { profilePicture: fileUrl },
        });
        break;
      default:
        return NextResponse.json({ message: 'Invalid user role' }, { status: 400 });
    }
    
    // Update the session to reflect new image immediately
    // The client-side component will handle the session update
    // await update({
    //   user: {
    //     image: fileUrl,
    //   },
    // });

    return NextResponse.json({ success: true, message: 'Photo uploaded successfully', fileUrl });

  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 