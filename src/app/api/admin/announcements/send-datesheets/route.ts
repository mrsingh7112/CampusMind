import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { datesheets } = await req.json();
    let createdAnnouncements = [];
    for (const ds of datesheets) {
      // Fetch students and faculty for this course/semester
      const students = await prisma.student.findMany({
        where: {
          courseId: ds.courseId,
          currentSemester: ds.semester,
        },
        select: { id: true, name: true, email: true }
      });
      const faculty = await prisma.faculty.findMany({
        where: {
          courses: {
            some: {
              courseId: ds.courseId
            }
          }
        },
        select: { id: true, name: true, email: true }
      });
      const recipients = [
        ...students.map(s => ({ ...s, role: 'STUDENT' })),
        ...faculty.map(f => ({ ...f, role: 'FACULTY' })),
      ];
      for (const r of recipients) {
        const message = `Dear ${r.name},\n\nPlease find attached the examination datesheet for your ${ds.departmentName} - ${ds.courseName} (Semester ${ds.semester}, ${ds.examType} exam).\n\nExam Rules:\n- Arrive 15 minutes before the exam.\n- Carry your ID card.\n- No electronic devices allowed.\n- Follow all university guidelines.\n\nBest of luck!\n\nRegards,\nExamination Cell`;
        const audience = `${ds.departmentName} - ${ds.courseName} - Semester ${ds.semester}`;
        const announcement = await prisma.announcement.create({
          data: {
            title: `Examination Datesheet for ${ds.courseName} (Semester ${ds.semester})`,
            content: message,
            audience,
            fileUrl: ds.pdfFile || `datesheet_${ds.departmentName}_${ds.courseName}_${ds.semester}.pdf`,
            sentAt: new Date(),
          }
        });
        // Create AnnouncementRecipient entries for all recipients
        const recipientData = recipients.map(r => ({
          announcementId: announcement.id,
          recipientId: r.id,
          recipientType: r.role,
        }));
        await prisma.announcementRecipient.createMany({ data: recipientData });
        createdAnnouncements.push(announcement);
      }
    }
    return NextResponse.json({ success: true, count: createdAnnouncements.length });
  } catch (error) {
    console.error('Error sending announcements:', error);
    return NextResponse.json({ error: 'Failed to send announcements' }, { status: 500 });
  }
} 