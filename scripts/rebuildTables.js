"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        console.log('Starting backup process...');
        // 1. Backup faculty data
        console.log('Backing up faculty data...');
        const facultyData = await prisma.faculty.findMany({
            include: {
                user: true,
            }
        });
        console.log(`Backed up ${facultyData.length} faculty records`);
        // 2. Backup student data
        console.log('Backing up student data...');
        const studentData = await prisma.student.findMany({
            include: {
                user: true,
            }
        });
        console.log(`Backed up ${studentData.length} student records`);
        // 3. Delete existing records in correct order (respecting foreign key constraints)
        console.log('Deleting existing records...');
        // First, delete dependent tables
        await prisma.notification.deleteMany({});
        await prisma.facultyWebAuthnCredential.deleteMany({});
        await prisma.facultyAttendance.deleteMany({});
        await prisma.activityLog.deleteMany({});
        await prisma.dashboardChartData.deleteMany({});
        // Then delete faculty and student records
        await prisma.faculty.deleteMany({});
        await prisma.student.deleteMany({});
        // Finally delete users
        const userIds = [
            ...facultyData.map(f => f.userId),
            ...studentData.map(s => s.userId)
        ];
        await prisma.user.deleteMany({
            where: {
                id: {
                    in: userIds
                }
            }
        });
        // 4. Restore faculty data
        console.log('Restoring faculty data...');
        for (const faculty of facultyData) {
            const { user, ...facultyInfo } = faculty;
            const { id: userId, ...userData } = user;
            // Create user first
            const newUser = await prisma.user.create({
                data: userData
            });
            // Create faculty record
            await prisma.faculty.create({
                data: {
                    ...facultyInfo,
                    userId: newUser.id
                }
            });
        }
        // 5. Restore student data
        console.log('Restoring student data...');
        for (const student of studentData) {
            const { user, ...studentInfo } = student;
            const { id: userId, ...userData } = user;
            // Create user first
            const newUser = await prisma.user.create({
                data: userData
            });
            // Create student record
            await prisma.student.create({
                data: {
                    ...studentInfo,
                    userId: newUser.id
                }
            });
        }
        console.log('Successfully rebuilt tables with existing data!');
    }
    catch (error) {
        console.error('Error during rebuild:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
