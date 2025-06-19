import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const announcementId = Number(params.id);
    const recipients = await prisma.announcementRecipient.findMany({
      where: { announcementId },
      include: {
        announcement: true,
      },
    });
    // Fetch names for recipients
    const facultyIds = recipients.filter(r => r.recipientType === 'FACULTY').map(r => r.recipientId);
    const studentIds = recipients.filter(r => r.recipientType === 'STUDENT').map(r => r.recipientId);
    const faculty = facultyIds.length > 0 ? await prisma.faculty.findMany({ where: { id: { in: facultyIds } }, select: { id: true, name: true } }) : [];
    const students = studentIds.length > 0 ? await prisma.student.findMany({ where: { id: { in: studentIds } }, select: { id: true, name: true } }) : [];
    const nameMap = Object.fromEntries([
      ...faculty.map(f => [f.id, f.name]),
      ...students.map(s => [s.id, s.name]),
    ]);
    return NextResponse.json(recipients.map(r => ({
      id: r.id,
      recipientId: r.recipientId,
      recipientType: r.recipientType,
      name: nameMap[r.recipientId] || r.recipientId,
      customContent: r.customContent,
      read: r.read,
      updatedAt: r.updatedAt,
    })));
  } catch (error) {
    console.error('Error fetching announcement recipients:', error);
    return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const announcementId = Number(params.id);
    const { recipientId, customContent } = await req.json();
    const updated = await prisma.announcementRecipient.updateMany({
      where: { announcementId, recipientId },
      data: { customContent },
    });
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error('Error updating recipient content:', error);
    return NextResponse.json({ error: 'Failed to update recipient content' }, { status: 500 });
  }
} 