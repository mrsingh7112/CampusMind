import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get announcements
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { role, id: userId } = session.user;

    let announcements;

    if (role === 'STUDENT') {
      // Get student's enrolled courses and department
      const student = await prisma.student.findUnique({
        where: { userId },
        include: {
          enrollments: {
            include: {
              subject: {
                include: {
                  course: true
                }
              }
            }
          },
          department: true
        }
      });

      if (!student) {
        return new NextResponse('Student not found', { status: 404 });
      }

      // Get relevant announcement IDs
      const relevantAnnouncements = await prisma.announcement.findMany({
        where: {
          OR: [
            { targetType: 'all' },
            { targetType: 'userTypes', userTypes: { has: 'STUDENT' } },
            {
              targetType: 'departments',
              departments: { has: student.departmentId }
            },
            {
              targetType: 'courses',
              courses: {
                hasSome: student.enrollments.map(e => e.subject.courseId)
              }
            },
            {
              targetType: 'semesters',
              semesters: {
                hasSome: student.enrollments.map(e => e.semesterId)
              }
            }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      announcements = relevantAnnouncements;
    } else if (role === 'FACULTY') {
      // Get faculty's courses and department
      const faculty = await prisma.faculty.findUnique({
        where: { userId },
        include: {
          subjects: {
            include: {
              course: true
            }
          },
          department: true
        }
      });

      if (!faculty) {
        return new NextResponse('Faculty not found', { status: 404 });
      }

      // Get relevant announcement IDs
      const relevantAnnouncements = await prisma.announcement.findMany({
        where: {
          OR: [
            { targetType: 'all' },
            { targetType: 'userTypes', userTypes: { has: 'FACULTY' } },
            {
              targetType: 'departments',
              departments: { has: faculty.departmentId }
            },
            {
              targetType: 'courses',
              courses: {
                hasSome: faculty.subjects.map(s => s.courseId)
              }
            }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      announcements = relevantAnnouncements;
    } else {
      // Admin can see all announcements
      announcements = await prisma.announcement.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Create announcement
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { title, message, targetType, departments, courses, semesters, userTypes } = await request.json();

    if (!title || !message || !targetType) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content: message,
        audience: targetType,
        fileUrl: null,
        sentAt: null,
      }
    });

    // Create notifications for targeted users
    if (targetType === 'all') {
      // Create notifications for all users by fetching from all user roles
      const admins = await prisma.admin.findMany({ select: { id: true } });
      const faculty = await prisma.faculty.findMany({ select: { id: true } });
      const students = await prisma.student.findMany({ select: { id: true } });

      const allUsers = [
        ...admins.map(user => ({ id: user.id, role: 'ADMIN' })),
        ...faculty.map(user => ({ id: user.id, role: 'FACULTY' })),
        ...students.map(user => ({ id: user.id, role: 'STUDENT' })),
      ];

      await Promise.all(allUsers.map(user =>
        prisma.notification.create({
          data: {
            title: 'New Announcement',
            message: `${title}: ${message}`,
            recipientId: user.id,
            recipientType: user.role,
            status: 'UNREAD',
            read: false
          }
        })
      ));
    } else {
      // Create notifications based on target type
      let targetUsers: any[] = [];

      if (userTypes && targetType === 'userTypes') {
        let usersFromTypes: any[] = [];
        if (userTypes.includes('ADMIN')) {
          const admins = await prisma.admin.findMany({ select: { id: true } });
          usersFromTypes.push(...admins.map(u => ({ id: u.id, role: 'ADMIN' })));
        }
        if (userTypes.includes('FACULTY')) {
          const faculty = await prisma.faculty.findMany({ select: { id: true } });
          usersFromTypes.push(...faculty.map(u => ({ id: u.id, role: 'FACULTY' })));
        }
        if (userTypes.includes('STUDENT')) {
          const students = await prisma.student.findMany({ select: { id: true } });
          usersFromTypes.push(...students.map(u => ({ id: u.id, role: 'STUDENT' })));
        }
        targetUsers = usersFromTypes;
      } else if (departments && targetType === 'departments') {
        let departmentUsers: any[] = [];
        // Fetch students in selected departments
        const studentsInDepartments = await prisma.student.findMany({
          where: {
            departmentId: {
              in: departments
            }
          },
          select: { id: true } // Only select ID
        });
        departmentUsers.push(...studentsInDepartments.map(s => ({ id: s.id, role: 'STUDENT' })));

        // Fetch faculty in selected departments
        const facultyInDepartments = await prisma.faculty.findMany({
          where: {
            departmentId: {
              in: departments
            }
          },
          select: { id: true } // Only select ID
        });
        departmentUsers.push(...facultyInDepartments.map(f => ({ id: f.id, role: 'FACULTY' })));

        targetUsers = departmentUsers;
      } else if (courses && targetType === 'courses') {
        let courseUsers: any[] = [];

        // Fetch students enrolled in selected courses
        const studentsInCourses = await prisma.student.findMany({
          where: {
            enrollments: {
              some: {
                subject: {
                  courseId: {
                    in: courses
                  }
                }
              }
            }
          },
          select: { id: true }
        });
        courseUsers.push(...studentsInCourses.map(s => ({ id: s.id, role: 'STUDENT' })));

        // Fetch faculty teaching selected courses
        const facultyInCourses = await prisma.faculty.findMany({
          where: {
            subjects: {
              some: {
                courseId: {
                  in: courses
                }
              }
            }
          },
          select: { id: true }
        });
        courseUsers.push(...facultyInCourses.map(f => ({ id: f.id, role: 'FACULTY' })));

        targetUsers = courseUsers;
      } else if (semesters && targetType === 'semesters') {
        const semesterUsers = await prisma.student.findMany({
          where: {
            enrollments: {
              some: {
                semesterId: {
                  in: semesters
                }
              }
            }
          },
          select: { id: true }
        });
        targetUsers = semesterUsers.map(s => ({ id: s.id, role: 'STUDENT' }));
      }

      // Create notifications for targeted users
      await Promise.all(targetUsers.map(user =>
        prisma.notification.create({
          data: {
            title: 'New Announcement',
            message: `${title}: ${message}`,
            recipientId: user.id,
            recipientType: user.role,
            status: 'UNREAD',
            read: false
          }
        })
      ));
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 