const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seeding...')

  // Log faculty count before and after deletion
  const facultyCountBefore = await prisma.faculty.count();
  console.log(`Faculty count before deletion: ${facultyCountBefore}`);
  await prisma.timetableSlot.deleteMany({});
  await prisma.facultyCourse.deleteMany({});
  await prisma.facultySubject.deleteMany({});
  await prisma.faculty.deleteMany({});
  const facultyCountAfter = await prisma.faculty.count();
  console.log(`Faculty count after deletion: ${facultyCountAfter}`);

  // Create Super Admin
  const adminPassword = await hash('123456', 10)
  const superAdmin = await prisma.admin.upsert({
    where: { email: 'baljinder.s7112@gmail.com' },
    update: {},
    create: {
      name: 'Baljinder Singh',
      email: 'baljinder.s7112@gmail.com',
      password: adminPassword,
      username: 'baljinder.s7112',
      isSuperAdmin: true
    }
  })
  console.log('Created or found Super Admin:', superAdmin.email)

  // Create 5 departments
  const departments = [
    { name: 'Computer Science', code: 'CS' },
    { name: 'Electronics Engineering', code: 'ECE' },
    { name: 'Mechanical Engineering', code: 'ME' },
    { name: 'Civil Engineering', code: 'CE' },
    { name: 'Information Technology', code: 'IT' }
  ]

  const createdDepartments = await Promise.all(
    departments.map(async (dept) => {
      return await prisma.department.upsert({
        where: { name: dept.name },
        update: {},
        create: dept
      })
    })
  )

  // Create 3 courses per department
  for (const dept of createdDepartments) {
    const courses = [
      { 
        name: `${dept.name} Engineering`, 
        code: `${dept.code}-BE`,
        totalSemesters: 8
      },
      { 
        name: `${dept.name} Technology`, 
        code: `${dept.code}-TECH`,
        totalSemesters: 6
      },
      { 
        name: `Advanced ${dept.name}`, 
        code: `${dept.code}-ADV`,
        totalSemesters: 8
      }
    ]

    for (const course of courses) {
      const createdCourse = await prisma.course.upsert({
        where: { code: course.code },
        update: {},
        create: {
          ...course,
          departmentId: dept.id
        }
      })

      // Create 5 subjects per semester
      for (let semester = 1; semester <= course.totalSemesters; semester++) {
        let subjects = [];
        // Decide subject types based on department
        const isComputer = /computer|it/i.test(course.name);
        const isMechanical = /mechanical/i.test(course.name);
        for (let index = 0; index < 5; index++) {
          let type = 'LECTURE';
          if (isComputer && index === 0) type = 'LAB';
          if (isMechanical && index === 0) type = 'WORKSHOP';
          subjects.push({
            name: `${course.name} Subject ${index + 1}`,
            code: `${course.code}-${semester}-${index + 1}`,
            semester,
            courseId: createdCourse.id,
            credits: Math.floor(Math.random() * 2) + 3, // Random credits between 3-4
            type
          });
        }
        await prisma.subject.createMany({
          data: subjects,
          skipDuplicates: true
        })
      }
    }
  }

  // Create 1000 students distributed across departments and courses
  const allCourses = await prisma.course.findMany()
  let studentCount = 0

  for (const course of allCourses) {
    // Calculate students per course (roughly 67 students per course to get 1000 total)
    const studentsPerCourse = Math.floor(1000 / allCourses.length)
    
    const students = Array.from({ length: studentsPerCourse }, (_, index) => ({
      name: `Student ${course.code} ${index + 1}`,
      email: `student.${course.code.toLowerCase()}${index + 1}@campus.edu`,
      password: adminPassword,
      rollNumber: `${course.code}${String(index + 1).padStart(3, '0')}`,
      courseId: course.id,
      currentSemester: Math.floor(Math.random() * course.totalSemesters) + 1,
      phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
    }))

    await prisma.student.createMany({
      data: students,
      skipDuplicates: true
    })

    studentCount += students.length
  }

  // --- Room/Block/Floor/Department Seeding ---
  const blockAssignments = {
    A: ['Computer Science', 'Electronics Engineering'],
    B: ['Civil Engineering'],
    C: ['Mechanical Engineering'],
    D: ['Information Technology'],
  };

  const roomTypes = ['LECTURE', 'LAB', 'WORKSHOP', 'FACULTY'];
  const blocks = ['A', 'B', 'C', 'D'];
  const floors = [1, 2, 3, 4, 5];
  const roomsToCreate = [];

  for (const block of blocks) {
    for (const floor of floors) {
      // 8 Classrooms per floor
      for (let i = 1; i <= 8; i++) {
        roomsToCreate.push({
          name: `${block}-${floor}0${i}`,
          capacity: 60,
          type: 'LECTURE',
          floor,
          building: block,
        });
      }
      // Labs: 2 per floor for A, 1 for B, 3 for C
      let labCount = block === 'A' ? 2 : block === 'B' ? 1 : 3;
      for (let l = 1; l <= labCount; l++) {
        roomsToCreate.push({
          name: `${block}-${floor}-Lab${l}`,
          capacity: 30,
          type: 'LAB',
          floor,
          building: block,
        });
      }
      // Workshops: only in Block C, 2 per floor
      if (block === 'C') {
        for (let w = 1; w <= 2; w++) {
          roomsToCreate.push({
            name: `${block}-${floor}-Workshop${w}`,
            capacity: 40,
            type: 'WORKSHOP',
            floor,
            building: block,
          });
        }
      }
      // Faculty/Department area: 1 per floor
      roomsToCreate.push({
        name: `${block}-${floor}-FacultyArea`,
        capacity: 10,
        type: 'FACULTY',
        floor,
        building: block,
      });
    }
  }
  await prisma.room.createMany({ data: roomsToCreate, skipDuplicates: true });
  console.log(`Created ${roomsToCreate.length} rooms across blocks A, B, C, D.`);

  console.log('Seeding completed!')
  console.log(`Created:
  - 5 Departments
  - 15 Courses (3 per department)
  - ${5 * 3 * 8 * 5} Subjects (5 per semester, 6-8 semesters per course)
  - 1000 Students`)

  // --- TEACHING FACULTY DISTRIBUTION ---
  const teachingFacultyPerDept = 22;
  const teachingFaculty = [];

  for (const dept of createdDepartments) {
    for (let i = 0; i < teachingFacultyPerDept; i++) {
      const name = `Faculty ${dept.code} ${i + 1}`;
      const email = `faculty.${dept.code.toLowerCase()}${i + 1}@campus.edu`;
      const faculty = await prisma.faculty.create({
        data: {
          name,
          email,
          password: adminPassword,
          departmentId: dept.id,
          position: 'Faculty',
          employeeId: `${dept.code}F${String(i + 1).padStart(3, '0')}`,
          status: 'ACTIVE',
        }
      });
      teachingFaculty.push(faculty);
    }
  }

  // After creating 110 teaching faculty (22 per department), add admin and support staff to reach 200 total faculty
  const adminNeeded = 50;
  const supportNeeded = 40;
  const adminNames = Array.from({length: adminNeeded}, (_, i) => `Admin Staff ${i+1}`);
  const supportNames = Array.from({length: supportNeeded}, (_, i) => `Support Staff ${i+1}`);
  let adminFaculty = [];
  let supportFaculty = [];

  for (let i = 0; i < adminNeeded; i++) {
    const name = adminNames[i];
    const email = `admin${i+1}@campus.edu`;
    const department = createdDepartments[i % createdDepartments.length];
    const faculty = await prisma.faculty.create({
      data: {
        name,
        email,
        password: adminPassword,
        departmentId: department.id,
        position: 'Admin',
        employeeId: `ADM${2000+i+1}`,
        status: 'ADMIN',
      }
    });
    adminFaculty.push(faculty);
  }
  for (let i = 0; i < supportNeeded; i++) {
    const name = supportNames[i];
    const email = `support${i+1}@campus.edu`;
    const department = createdDepartments[i % createdDepartments.length];
    const faculty = await prisma.faculty.create({
      data: {
        name,
        email,
        password: adminPassword,
        departmentId: department.id,
        position: 'Support',
        employeeId: `SUP${2000+i+1}`,
        status: 'SUPPORT',
      }
    });
    supportFaculty.push(faculty);
  }
  // Assign HODs (1 per course)
  let adminIndex = 0;
  for (const course of allCourses) {
    const hod = adminFaculty[adminIndex % adminFaculty.length];
    const exists = await prisma.facultyCourse.findUnique({
      where: { facultyId_courseId_semester: { facultyId: hod.id, courseId: course.id, semester: 0 } }
    });
    if (!exists) {
      await prisma.facultyCourse.create({
        data: {
          facultyId: hod.id,
          courseId: course.id,
          semester: 0,
          status: 'HOD',
        }
      });
    }
    adminIndex++;
  }
  // Assign Deans (1 per department)
  for (let i = 0; i < createdDepartments.length; i++) {
    const dean = adminFaculty[(adminIndex + i) % adminFaculty.length];
    let deanCourse = await prisma.course.findFirst({ where: { name: `${createdDepartments[i].name} Dean` } });
    if (!deanCourse) {
      deanCourse = await prisma.course.create({
        data: {
          name: `${createdDepartments[i].name} Dean`,
          code: `${createdDepartments[i].code}-DEAN`,
          departmentId: createdDepartments[i].id,
          totalSemesters: 1,
          status: 'ADMIN',
        }
      });
    }
    const exists = await prisma.facultyCourse.findUnique({
      where: { facultyId_courseId_semester: { facultyId: dean.id, courseId: deanCourse.id, semester: 0 } }
    });
    if (!exists) {
      await prisma.facultyCourse.create({
        data: {
          facultyId: dean.id,
          courseId: deanCourse.id,
          semester: 0,
          status: 'DEAN',
        }
      });
    }
  }
  // Assign 5 admins to Fee Department (create a dummy course if needed)
  let feeCourse = await prisma.course.findFirst({ where: { name: 'Fee Department' } });
  if (!feeCourse) {
    feeCourse = await prisma.course.create({
      data: {
        name: 'Fee Department',
        code: 'FEE-DEPT',
        departmentId: createdDepartments[0].id,
        totalSemesters: 1,
        status: 'ADMIN',
      }
    });
  }
  for (let i = 0; i < 5; i++) {
    const feeAdmin = adminFaculty[(adminIndex + createdDepartments.length + i) % adminFaculty.length];
    const exists = await prisma.facultyCourse.findUnique({
      where: { facultyId_courseId_semester: { facultyId: feeAdmin.id, courseId: feeCourse.id, semester: 0 } }
    });
    if (!exists) {
      await prisma.facultyCourse.create({
        data: {
          facultyId: feeAdmin.id,
          courseId: feeCourse.id,
          semester: 0,
          status: 'FEE',
        }
      });
    }
  }

  // --- ASSIGN TEACHING FACULTY TO COURSES & SUBJECTS (by department) ---
  const allSubjects = await prisma.subject.findMany();

  for (const dept of createdDepartments) {
    // Get this department's faculty
    const deptFaculty = teachingFaculty.filter((f: any) => f.departmentId === dept.id);
    // Get this department's courses
    const deptCourses = allCourses.filter((c: any) => c.departmentId === dept.id);
    // Assign every faculty to every course in their department
    for (const faculty of deptFaculty) {
      for (const course of deptCourses) {
        const exists = await prisma.facultyCourse.findUnique({
          where: { facultyId_courseId_semester: { facultyId: faculty.id, courseId: course.id, semester: 1 } }
        });
        if (!exists) {
          await prisma.facultyCourse.create({
            data: {
              facultyId: faculty.id,
              courseId: course.id,
              semester: 1,
              status: 'ACTIVE',
            }
          });
        }
      }
    }
    // Assign subjects round-robin
    const deptSubjects = allSubjects.filter((s: any) => deptCourses.some((c: any) => c.id === s.courseId));
    let fsIndex = 0;
    for (const subject of deptSubjects) {
      const faculty = deptFaculty[fsIndex % deptFaculty.length];
      const exists = await prisma.facultySubject.findUnique({
        where: { facultyId_subjectId: { facultyId: faculty.id, subjectId: subject.id } }
      });
      if (!exists) {
        await prisma.facultySubject.create({
          data: {
            facultyId: faculty.id,
            subjectId: subject.id,
          }
        });
      }
      fsIndex++;
    }
  }
  // ... existing code for admin, HOD, Dean, Fee assignments ...
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 