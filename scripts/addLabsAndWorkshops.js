const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all courses and their semesters
  const courses = await prisma.course.findMany();
  for (const course of courses) {
    // Find all semesters for this course
    const semesters = await prisma.subject.findMany({
      where: { courseId: course.id },
      select: { semester: true },
      distinct: ['semester'],
    });
    for (const sem of semesters) {
      const semester = sem.semester;
      // Add a lab subject
      const lab = await prisma.subject.upsert({
        where: { code: `LAB-${course.id}-${semester}` },
        update: {},
        create: {
          name: `Lab for ${course.name} Sem ${semester}`,
          code: `LAB-${course.id}-${semester}`,
          type: 'LAB',
          credits: 1,
          courseId: course.id,
          semester,
        },
      });
      // Add a workshop subject
      const workshop = await prisma.subject.upsert({
        where: { code: `WORKSHOP-${course.id}-${semester}` },
        update: {},
        create: {
          name: `Workshop for ${course.name} Sem ${semester}`,
          code: `WORKSHOP-${course.id}-${semester}`,
          type: 'WORKSHOP',
          credits: 1,
          courseId: course.id,
          semester,
        },
      });
      // Assign to a random faculty
      const faculty = await prisma.faculty.findFirst();
      if (faculty) {
        await prisma.facultySubject.upsert({
          where: { facultyId_subjectId: { facultyId: faculty.id, subjectId: lab.id } },
          update: {},
          create: { facultyId: faculty.id, subjectId: lab.id },
        });
        await prisma.facultySubject.upsert({
          where: { facultyId_subjectId: { facultyId: faculty.id, subjectId: workshop.id } },
          update: {},
          create: { facultyId: faculty.id, subjectId: workshop.id },
        });
      }
    }
  }
  // Ensure at least one lab room exists
  await prisma.room.upsert({
    where: { name: 'Lab Room 1' },
    update: {},
    create: {
      name: 'Lab Room 1',
      capacity: 30,
      type: 'LAB',
      floor: 1,
      building: 'A',
      status: 'ACTIVE',
    },
  });
  console.log('Labs, workshops, and assignments added!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 