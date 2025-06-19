import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all recipients
    const recipients = await prisma.announcementRecipient.findMany({
      include: {
        announcement: true,
      },
    });
    // Collect all faculty and student IDs
    const facultyIds = recipients.filter(r => r.recipientType === 'FACULTY').map(r => r.recipientId);
    const studentIds = recipients.filter(r => r.recipientType === 'STUDENT').map(r => r.recipientId);
    const faculty = facultyIds.length > 0 ? await prisma.faculty.findMany({ where: { id: { in: facultyIds } }, select: { id: true, name: true } }) : [];
    const students = studentIds.length > 0 ? await prisma.student.findMany({ where: { id: { in: studentIds } }, select: { id: true, name: true } }) : [];
    const nameMap = Object.fromEntries([
      ...faculty.map(f => [f.id, f.name]),
      ...students.map(s => [s.id, s.name]),
    ]);
    // Return all recipients with names and details
    return NextResponse.json(recipients.map(r => ({
      id: r.id,
      announcementId: r.announcementId,
      recipientId: r.recipientId,
      recipientType: r.recipientType,
      name: nameMap[r.recipientId] || r.recipientId,
      customContent: r.customContent,
      read: r.read,
      updatedAt: r.updatedAt,
      sentAt: r.announcement?.sentAt || null,
    })));
  } catch (error) {
    console.error('Error fetching all announcement recipients:', error);
    return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
  }
} 