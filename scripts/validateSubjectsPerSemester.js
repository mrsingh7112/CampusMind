const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    include: { subjects: true }
  });
  let allGood = true;
  for (const course of courses) {
    for (let semester = 1; semester <= course.totalSemesters; semester++) {
      const count = course.subjects.filter(s => s.semester === semester).length;
      if (count !== 5) {
        allGood = false;
        console.warn(`WARNING: Course '${course.name}' (ID: ${course.id}), Semester ${semester} has ${count} subjects!`);
      }
    }
  }
  if (allGood) {
    console.log('All semesters for all courses have exactly 5 subjects.');
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect()); 