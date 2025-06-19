const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany();
  for (const course of courses) {
    for (let semester = 1; semester <= course.totalSemesters; semester++) {
      const subjects = await prisma.subject.findMany({
        where: { courseId: course.id, semester }
      });
      if (subjects.length < 5) {
        const toCreate = 5 - subjects.length;
        for (let i = 1; i <= toCreate; i++) {
          const code = `C${course.id}S${semester}SUB${subjects.length + i}`;
          await prisma.subject.create({
            data: {
              name: `Subject ${subjects.length + i} (Sem ${semester}, ${course.name})`,
              code,
              semester,
              courseId: course.id,
              credits: 3,
              status: 'ACTIVE',
            }
          });
          console.log(`Created subject ${code} for course ${course.name}, semester ${semester}`);
        }
      }
    }
  }
  console.log('Subject seeding complete!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect()); 