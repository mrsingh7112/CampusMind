const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanDepartments() {
  try {
    // First delete all subjects as they depend on courses
    await prisma.subject.deleteMany({})
    console.log('✅ Deleted all subjects')

    // Then delete all courses as they depend on departments
    await prisma.course.deleteMany({})
    console.log('✅ Deleted all courses')

    // Finally delete all departments
    await prisma.department.deleteMany({})
    console.log('✅ Deleted all departments')

    console.log('🎉 Database cleaned successfully!')
  } catch (error) {
    console.error('Error cleaning database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDepartments() 