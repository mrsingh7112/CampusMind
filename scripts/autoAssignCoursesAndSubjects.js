const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const faculties = await prisma.faculty.findMany({ include: { department: true } });
  const allSubjects = await prisma.subject.findMany();
  // Distribute subjects as evenly as possible among faculty
  let facultyIdx = 0;
  for (const subject of allSubjects) {
    // Assign to a faculty from the same department if possible
    const course = await prisma.course.findUnique({ where: { id: subject.courseId } });
    const deptFaculties = faculties.filter(f => f.departmentId === course.departmentId);
    let assignedFaculty = null;
    if (deptFaculties.length > 0) {
      assignedFaculty = deptFaculties[facultyIdx % deptFaculties.length];
      facultyIdx++;
    } else {
      assignedFaculty = faculties[facultyIdx % faculties.length];
      facultyIdx++;
    }
    await prisma.facultySubject.create({ data: { facultyId: assignedFaculty.id, subjectId: subject.id } });
    }
  console.log('All subjects assigned to faculty (new methodology).');
}

function shuffle(array) {
  return array.map(a => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map(a => a[1]);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect()); 