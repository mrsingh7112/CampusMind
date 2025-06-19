import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    const audienceType = formData.get('audienceType') as string; // ALL, COURSE, DEPARTMENT, FACULTY_DEPARTMENT
    const targetId = formData.get('targetId') as string | null;
    let fileUrl = null;
    const file = formData.get('file') as File | null;
    if (file && file.size > 0) {
      // Save file to /public/uploads (for demo, not production safe)
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `./public/uploads/${fileName}`;
      require('fs').writeFileSync(filePath, buffer);
      fileUrl = `/uploads/${fileName}`;
    }
    // Find recipients
    let recipients: { id: string, type: string }[] = [];
    if (audienceType === 'ALL') {
      const students = await prisma.student.findMany({ select: { id: true } });
      const faculty = await prisma.faculty.findMany({ select: { id: true } });
      recipients = [
        ...students.map(s => ({ id: s.id, type: 'STUDENT' })),
        ...faculty.map(f => ({ id: f.id, type: 'FACULTY' })),
      ];
    } else if (audienceType === 'COURSE') {
      const students = await prisma.student.findMany({ where: { courseId: Number(targetId) }, select: { id: true } });
      recipients = students.map(s => ({ id: s.id, type: 'STUDENT' }));
    } else if (audienceType === 'DEPARTMENT') {
      const courses = await prisma.course.findMany({ where: { departmentId: Number(targetId) }, select: { id: true } });
      const courseIds = courses.map(c => c.id);
      const students = await prisma.student.findMany({ where: { courseId: { in: courseIds } }, select: { id: true } });
      recipients = students.map(s => ({ id: s.id, type: 'STUDENT' }));
    } else if (audienceType === 'FACULTY_DEPARTMENT') {
      const faculty = await prisma.faculty.findMany({ where: { department: targetId || '' }, select: { id: true } });
      recipients = faculty.map(f => ({ id: f.id, type: 'FACULTY' }));
    }
    // Create notifications
    for (const r of recipients) {
      await prisma.notification.create({
        data: {
          title,
          message,
          recipientId: r.id,
          recipientType: r.type,
          fileUrl,
        },
      });
    }
    return NextResponse.json({ success: true, count: recipients.length });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification.' }, { status: 500 });
  }
} 