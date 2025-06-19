const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany();
  for (const course of courses) {
    for (let semester = 1; semester <= course.totalSemesters; semester++) {
      const email = `student${semester}_course${course.id}@demo.com`;
      const rollNumber = `C${course.id}S${semester}`;
      // Avoid duplicate students
      const exists = await prisma.student.findUnique({ where: { email } });
      if (!exists) {
        await prisma.student.create({
          data: {
            name: `Student S${semester}C${course.id}`,
            email,
            courseId: course.id,
            currentSemester: semester,
            rollNumber,
            password: await hash('password', 10),
            status: 'ACTIVE',
          }
        });
        console.log(`Created student for course ${course.name}, semester ${semester}`);
      }
    }
  }
  console.log('Seeding complete!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect()); 