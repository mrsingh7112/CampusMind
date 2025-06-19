import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { role?: string } | undefined;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, semester } = body;

    if (!courseId || !semester) {
      return NextResponse.json({ error: 'Course ID and semester are required' }, { status: 400 });
    }

    console.log(`[TIMETABLE] Starting generation for courseId=${courseId}, semester=${semester}`);

    // Fetch course and subjects
    const course = await prisma.course.findUnique({ 
      where: { id: courseId }, 
      include: { department: true } 
    });
    
    if (!course) {
      console.error(`[TIMETABLE] Course not found: courseId=${courseId}`);
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Fetch subjects and faculty
    const subjects = await prisma.subject.findMany({ 
      where: { courseId: course.id, semester } 
    });

    if (!subjects || subjects.length === 0) {
      console.error(`[TIMETABLE] No subjects found for courseId=${courseId}, semester=${semester}`);
      return NextResponse.json({ error: 'No subjects found for this course and semester' }, { status: 404 });
    }

    console.log(`[TIMETABLE] Found ${subjects.length} subjects`);

    // Only allow teaching faculty (exclude Dean, Admin, Support, HOD, etc.)
    const NON_TEACHING_POSITIONS = [
      'Dean', 'Admin', 'Support', 'HOD', 'Head of Department', 'Principal', 'Director', 'Office', 'Clerk', 'Registrar', 'Assistant Registrar', 'Manager', 'Assistant Manager', 'Accountant', 'Finance', 'Library', 'Librarian', 'System Admin', 'Technical', 'Maintenance', 'Peon', 'Sweeper', 'Security', 'Receptionist', 'Counselor', 'Exam', 'Examiner', 'Exam Cell', 'Admission', 'Admission Cell', 'Transport', 'Driver', 'Warden', 'Hostel', 'Mess', 'Canteen', 'Medical', 'Nurse', 'Doctor', 'Lab Assistant', 'Workshop Assistant', 'Store', 'Storekeeper', 'Purchase', 'Procurement', 'IT', 'Network', 'Virtual Faculty', 'Virtual', 'Fee', 'Support Staff', 'Admin Staff', 'Dean Staff', 'HOD Staff'
    ];
    const facultySubjects = await prisma.facultySubject.findMany({
      where: { 
        subject: { courseId: course.id, semester },
        faculty: {
          NOT: {
            OR: NON_TEACHING_POSITIONS.map(pos => ({ position: { contains: pos, mode: 'insensitive' } }))
          }
        }
      },
      include: { faculty: true, subject: true },
    });

    if (!facultySubjects || facultySubjects.length === 0) {
      console.error(`[TIMETABLE] No faculty assigned to subjects for courseId=${courseId}, semester=${semester}`);
      return NextResponse.json({ error: 'No faculty assigned to subjects' }, { status: 404 });
    }

    console.log(`[TIMETABLE] Found ${facultySubjects.length} faculty-subject assignments`);

    // Pre-fetch all rooms
    const allRooms = await prisma.room.findMany({ where: { status: 'ACTIVE' } });
    const lectureRooms = allRooms.filter(r => r.type === 'LECTURE');
    const labRooms = allRooms.filter(r => r.type === 'LAB');
    const workshopRooms = allRooms.filter(r => r.type === 'WORKSHOP');

    if (lectureRooms.length === 0) {
      console.error('[TIMETABLE] No lecture rooms available');
      return NextResponse.json({ error: 'No lecture rooms available' }, { status: 404 });
    }

    // Assign a fixed room for this course and semester
    const assignedRoom = lectureRooms[Math.floor(Math.random() * lectureRooms.length)];
    console.log(`[TIMETABLE] Assigned room: ${assignedRoom.name}`);

    const days = [1, 2, 3, 4, 5];
    const timeSlots = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
    ];

    // Track faculty assignments
    const facultyWeeklyAssignments = new Map(); // facultyId -> Set of `${day}-${slotIdx}`

    // Assign lunch slots: randomly pick 11-12 or 12-1 for each day
    const lunchSlots: Record<number, number> = {};
    for (const day of days) {
      lunchSlots[day] = Math.random() < 0.5 ? 2 : 3; // 2: 11-12, 3: 12-1
    }
    console.log('[TIMETABLE] Lunch slots assigned:', lunchSlots);

    const isLunchPeriod = (day: number, slotIdx: number) => lunchSlots[day] === slotIdx;

    // Schedule labs/workshops first
    const assignedSlots = [];
    const isComputerRelated = /computer|it/i.test(course.name) || /computer|it/i.test(course.department.name);
    const isMechanicalOrWorkshop = /mechanical|electrical|civil|workshop/i.test(course.name) || /mechanical|electrical|civil|workshop/i.test(course.department.name);

    let practicals = [];
    if (isComputerRelated) {
      practicals = subjects.filter(s => s.type === 'LAB');
    } else if (isMechanicalOrWorkshop) {
      practicals = subjects.filter(s => s.type === 'WORKSHOP');
    }

    console.log(`[TIMETABLE] Found ${practicals.length} practical subjects`);

    // Schedule practicals
    let practicalCounter = 0;
    for (const practical of practicals) {
      let scheduled = false;
      const daysShuffled = [...days].sort(() => Math.random() - 0.5);
      const practicalRooms = isComputerRelated ? labRooms : workshopRooms;

      if (practicalRooms.length === 0) {
        console.warn(`[TIMETABLE] No ${isComputerRelated ? 'lab' : 'workshop'} rooms available for practical: ${practical.name}`);
        continue;
      }

      for (const day of daysShuffled) {
        for (let slotIdx = 0; slotIdx < timeSlots.length - 1; slotIdx++) {
          if (isLunchPeriod(day, slotIdx) || isLunchPeriod(day, slotIdx + 1)) continue;

          const faculty = facultySubjects.find(f => f.subjectId === practical.id)?.faculty;
          if (!faculty) {
            console.warn(`[TIMETABLE] No faculty found for practical: ${practical.name}`);
            continue;
          }

          // Check faculty availability
          if (!facultyWeeklyAssignments.has(faculty.id)) facultyWeeklyAssignments.set(faculty.id, new Set());
          const facSet = facultyWeeklyAssignments.get(faculty.id);
          if (facSet.has(`${day}-${slotIdx}`) || facSet.has(`${day}-${slotIdx+1}`)) continue;

          // Find an available practical room
          const foundRoom = practicalRooms[Math.floor(Math.random() * practicalRooms.length)];
          if (!foundRoom) continue;

          assignedSlots.push({
            courseId: course.id,
            subjectId: practical.id,
            facultyId: faculty.id,
            roomId: foundRoom.id,
            dayOfWeek: day,
            startTime: timeSlots[slotIdx].start,
            endTime: timeSlots[slotIdx + 1].end,
            semester,
          });

          // Mark faculty as used
          facSet.add(`${day}-${slotIdx}`);
          facSet.add(`${day}-${slotIdx + 1}`);
          scheduled = true;
          console.log(`[TIMETABLE] Scheduled practical: ${practical.name} on day ${day}, slots ${slotIdx}-${slotIdx+1}`);
          break;
        }
        if (scheduled) break;
      }

      if (!scheduled) {
        console.warn(`[TIMETABLE] Could not schedule practical: ${practical.name}`);
      }
      practicalCounter++;
      console.log(`[TIMETABLE] Practical scheduling progress: ${practicalCounter}/${practicals.length}`);
    }
    console.log('[TIMETABLE] Finished scheduling practicals. Assigned slots so far:', assignedSlots.length);

    // --- Schedule lectures into a flat list of all available (non-lunch) slots for the week ---
    const allAvailableSlots = [];
    for (const day of days) {
      for (let slotIdx = 0; slotIdx < timeSlots.length; slotIdx++) {
        if (isLunchPeriod(day, slotIdx)) continue;
        allAvailableSlots.push({ day, slotIdx });
      }
    }
    // Shuffle all available slots
    for (let i = allAvailableSlots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAvailableSlots[i], allAvailableSlots[j]] = [allAvailableSlots[j], allAvailableSlots[i]];
    }
    // Prepare lecture assignments
    const nonLabWorkshopSubjects = subjects.filter(s => s.type !== 'LAB' && s.type !== 'WORKSHOP');
    const totalLectures = allAvailableSlots.length;
    let subjectIdx = 0;
    let assignedLectureSlots = 0;
    // Assign as many lectures as possible
    for (const slot of allAvailableSlots) {
      if (subjectIdx >= nonLabWorkshopSubjects.length) subjectIdx = 0; // Repeat subjects if needed
      const subj = nonLabWorkshopSubjects[subjectIdx];
      const faculty = facultySubjects.find(f => f.subjectId === subj.id)?.faculty;
      if (!faculty) {
        subjectIdx++;
        continue;
      }
      if (!facultyWeeklyAssignments.has(faculty.id)) facultyWeeklyAssignments.set(faculty.id, new Set());
      const facSet = facultyWeeklyAssignments.get(faculty.id);
      if (facSet.has(`${slot.day}-${slot.slotIdx}`)) {
        subjectIdx++;
        continue;
      }
      assignedSlots.push({
        courseId: course.id,
        subjectId: subj.id,
        facultyId: faculty.id,
        roomId: assignedRoom.id,
        dayOfWeek: slot.day,
        startTime: timeSlots[slot.slotIdx].start,
        endTime: timeSlots[slot.slotIdx].end,
        semester,
      });
      facSet.add(`${slot.day}-${slot.slotIdx}`);
      assignedLectureSlots++;
      subjectIdx++;
      // Stop if we've assigned as many lectures as there are subjects * their credits (or some max)
      if (assignedLectureSlots >= nonLabWorkshopSubjects.length * 5) break;
    }
    console.log('[TIMETABLE] Finished scheduling lectures. Total assigned slots:', assignedSlots.length);

    // Save to DB: delete old, insert new
    console.log('[TIMETABLE] Deleting old slots from DB...');
    await prisma.timetableSlot.deleteMany({ where: { courseId: course.id, semester } });
    console.log(`[TIMETABLE] Deleted old slots for courseId=${courseId}, semester=${semester}`);

    let dbInsertCounter = 0;
    for (const slot of assignedSlots) {
      await prisma.timetableSlot.create({ data: slot });
      dbInsertCounter++;
      if (dbInsertCounter % 5 === 0 || dbInsertCounter === assignedSlots.length) {
        console.log(`[TIMETABLE] Inserted ${dbInsertCounter}/${assignedSlots.length} slots into DB`);
      }
    }
    console.log(`[TIMETABLE] Created ${assignedSlots.length} new slots`);

    // Fetch and return
    const fullSlots = await prisma.timetableSlot.findMany({
      where: { courseId: course.id, semester },
      include: {
        subject: { select: { id: true, name: true, code: true, type: true } },
        faculty: { select: { id: true, name: true, email: true } },
        room: { select: { id: true, name: true, type: true, building: true, floor: true } },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    console.log(`[TIMETABLE] Successfully generated timetable with ${fullSlots.length} slots`);

    return NextResponse.json({ 
      message: 'Timetable generated', 
      timetable: {
        course: { id: course.id, name: course.name, code: course.code },
        semester,
        slots: fullSlots
      }
    });
  } catch (error) {
    console.error('[TIMETABLE] Error generating timetable:', error);
    return NextResponse.json(
      { error: 'Failed to generate timetable' },
      { status: 500 }
    );
  }
}

// Helper function to create a virtual faculty
async function createVirtualFaculty(departmentId: number, subjectName: string) {
  const virtualFaculty = await prisma.faculty.create({
    data: {
      name: `Virtual Faculty - ${subjectName}`,
      email: `virtual.${subjectName.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
      password: 'virtual123', // This will be changed by the faculty
      departmentId,
      position: 'Virtual Faculty',
      employeeId: `VF${Date.now()}`,
      status: 'ACTIVE'
    }
  });
  return virtualFaculty;
}

// Helper function to create a virtual room
async function createVirtualRoom(courseName: string) {
  const virtualRoom = await prisma.room.create({
    data: {
      name: `Virtual-${courseName}-${Date.now()}`,
      capacity: 100,
      type: 'VIRTUAL',
      floor: 0,
      building: 'ONLINE',
      isVirtual: true,
      status: 'ACTIVE',
    },
  });
  return virtualRoom;
}

// Helper function to handle faculty shortage
async function handleFacultyShortage(subject: any, departmentId: number) {
  console.log(`[TIMETABLE DEBUG] Creating virtual faculty for subject: ${subject.name}`);
  const virtualFaculty = await createVirtualFaculty(departmentId, subject.name);
  
  // Assign the virtual faculty to the subject
  await prisma.facultySubject.create({
    data: {
      facultyId: virtualFaculty.id,
      subjectId: subject.id
    }
  });
  
  return virtualFaculty;
}

// Helper function to handle room shortage
async function handleRoomShortage(course: any, type: string) {
  console.log(`[TIMETABLE DEBUG] Creating virtual room for course: ${course.name}`);
  const virtualRoom = await createVirtualRoom(course.name);
  return virtualRoom;
} 