import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IncomingForm } from 'formidable'
import path from 'path'
import fs from 'fs/promises'

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public/uploads/avatars');

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await fs.mkdir(uploadDir, { recursive: true });

    const form = new IncomingForm({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        return `${session.user.id}-${uniqueSuffix}${ext}`;
      },
    });

    const [fields, files] = await form.parse(req as any);

    const file = (files as any).avatar?.[0];
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const oldAvatar = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { avatar: true },
    });

    // Delete old avatar if it exists and is not the default
    if (oldAvatar?.avatar && oldAvatar.avatar.startsWith('/uploads/avatars/')) {
      try {
        await fs.unlink(path.join(process.cwd(), 'public', oldAvatar.avatar));
      } catch (unlinkError: any) {
        console.warn('Could not delete old avatar:', unlinkError.message);
      }
    }

    const avatarUrl = `/uploads/avatars/${path.basename(file.filepath)}`;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({ message: 'Avatar updated successfully', avatarUrl });
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    if (error.message.includes('file size exceeded')) {
      return NextResponse.json({ error: 'File size exceeds limit (5MB)' }, { status: 413 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 